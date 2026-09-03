function tag(text,name){
  const re=new RegExp(`<${name}>([\\s\\S]*?)</${name}>`,`i`);
  return text.match(re)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g,"").trim() || "";
}
function allTags(text,name){
  const re=new RegExp(`<${name}>([\\s\\S]*?)</${name}>`,`gi`);
  return [...text.matchAll(re)].map(m=>m[1].replace(/<!\[CDATA\[|\]\]>/g,"").trim());
}
function num(v){const n=Number.parseFloat(v);return Number.isFinite(n)?n:0}
async function fetchAvatarFrame(steamId){
  try{
    const r=await fetch(`https://steamcommunity.com/profiles/${steamId}/?xml=1`,{headers:{"User-Agent":"Mozilla/5.0"}});
    if(!r.ok)return null;
    const text=await r.text();
    const candidates=["avatarFrame","avatarframe","avatarFrameURL","avatarframeurl","profileAvatarFrame"];
    for(const name of candidates){
      const value=tag(text,name);
      if(value&&/^https?:\\/\\//i.test(value))return value;
    }
    return null;
  }catch{return null}
}
export default async function handler(req,res){
  const key=process.env.STEAM_API_KEY;
  const steamId=process.env.STEAM_ID;
  try{
    if(key&&steamId){
      const [p,g,b,frame]=await Promise.all([
        fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${key}&steamids=${steamId}`).then(r=>r.json()),
        fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${key}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`).then(r=>r.json()),
        fetch(`https://api.steampowered.com/IPlayerService/GetBadges/v1/?key=${key}&steamid=${steamId}`).then(r=>r.json()),
        fetchAvatarFrame(steamId)
      ]);
      const x=p.response?.players?.[0], games=g.response?.games||[];
      const minutes=games.reduce((a,v)=>a+(v.playtime_forever||0),0);
      const recentMinutes=games.reduce((a,v)=>a+(v.playtime_2weeks||0),0);
      const gameCount=Number.isFinite(g.response?.game_count)?g.response.game_count:games.length;
      const badgeCount=Array.isArray(b.response?.badges)?b.response.badges.length:0;
      return res.status(200).json({
        games:gameCount,
        playtime:`${Math.floor(minutes/60).toLocaleString()}h`,
        recent:`${Math.floor(recentMinutes/60).toLocaleString()}h`,
        friends:"public profile",
        badges:badgeCount,
        age:x?.timecreated?`${Math.floor((Date.now()/1000-x.timecreated)/31557600)}y`:"—",
        profile:x,
        avatarFrame:frame
      });
    }

    const profileR=await fetch("https://steamcommunity.com/id/chungusanimals/?xml=1",{headers:{"User-Agent":"Mozilla/5.0"}});
    const profileText=await profileR.text();
    if(!profileR.ok || /<error>/i.test(profileText)) throw new Error("Steam profile unavailable");

    const gamesR=await fetch("https://steamcommunity.com/id/chungusanimals/games/?tab=all&xml=1",{headers:{"User-Agent":"Mozilla/5.0"}});
    const gamesText=await gamesR.text();
    const hours=allTags(gamesText,"hoursOnRecord").map(num);
    const recent=allTags(gamesText,"hoursLast2Weeks").map(num);
    const games=allTags(gamesText,"appID").length;
    const totalHours=hours.reduce((a,b)=>a+b,0);
    const recentHours=recent.reduce((a,b)=>a+b,0);
    const memberSince=tag(profileText,"memberSince");
    const online=tag(profileText,"onlineState");
    const privacy=tag(profileText,"privacyState");
    const badgeCount=tag(profileText,"badgeCount");
    const frame=tag(profileText,"avatarFrame")||tag(profileText,"avatarframe")||null;
    return res.status(200).json({
      games:games || tag(profileText,"gameCount") || "—",
      playtime:totalHours?`${Math.floor(totalHours).toLocaleString()}h`:"—",
      recent:recentHours?`${Math.floor(recentHours).toLocaleString()}h`:"0h",
      friends:"public profile",
      badges:badgeCount || "—",
      age:memberSince || "—",
      online:online || "offline",
      privacy:privacy || "unknown",
      profile:{personaname:tag(profileText,"steamID")||"chungusanimals"},
      avatarFrame:frame
    });
  }catch(e){return res.status(502).json({error:e.message})}
}
