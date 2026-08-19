function tag(text,name){
  const re=new RegExp(`<${name}>([\\s\\S]*?)</${name}>`,`i`);
  return text.match(re)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g,"").trim() || "";
}
function allTags(text,name){
  const re=new RegExp(`<${name}>([\\s\\S]*?)</${name}>`,`gi`);
  return [...text.matchAll(re)].map(m=>m[1].replace(/<!\[CDATA\[|\]\]>/g,"").trim());
}
function num(v){const n=Number.parseFloat(v);return Number.isFinite(n)?n:0}
export default async function handler(req,res){
  const key=process.env.STEAM_API_KEY;
  const steamId=process.env.STEAM_ID;
  try{
    if(key&&steamId){
      const [p,g]=await Promise.all([
        fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${key}&steamids=${steamId}`).then(r=>r.json()),
        fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${key}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`).then(r=>r.json())
      ]);
      const x=p.response?.players?.[0], games=g.response?.games||[];
      const minutes=games.reduce((a,b)=>a+(b.playtime_forever||0),0);
      const recentMinutes=games.reduce((a,b)=>a+(b.playtime_2weeks||0),0);
      return res.status(200).json({games:games.length,playtime:`${Math.floor(minutes/60).toLocaleString()}h`,recent:`${Math.floor(recentMinutes/60).toLocaleString()}h`,friends:"—",badges:"—",age:x?.timecreated?`${Math.floor((Date.now()/1000-x.timecreated)/31557600)}y`:"—",profile:x});
    }

    // Public Steam XML fallback. Valve documents the profile/game XML endpoints,
    // although the XML format is deprecated. It works without a Steam Web API key
    // when the profile/library is public.
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
    return res.status(200).json({
      games:games || tag(profileText,"gameCount") || "—",
      playtime:totalHours?`${Math.floor(totalHours).toLocaleString()}h`:"—",
      recent:recentHours?`${Math.floor(recentHours).toLocaleString()}h`:"0h",
      friends:"public profile",
      badges:"—",
      age:memberSince || "—",
      online:online || "offline",
      privacy:privacy || "unknown",
      profile:{personaname:tag(profileText,"steamID")||"chungusanimals"}
    });
  }catch(e){return res.status(502).json({error:e.message})}
}
