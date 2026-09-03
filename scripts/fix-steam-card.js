import fs from "node:fs";

const mainPath = "src/main.jsx";
const stylesPath = "src/styles.css";
let source = fs.readFileSync(mainPath, "utf8");
let styles = fs.readFileSync(stylesPath, "utf8");

const gamesStart = source.indexOf("function Games()");
const gamesEnd = source.indexOf("function GameCard(", gamesStart);
if (gamesStart === -1 || gamesEnd === -1) throw new Error("fix-steam-card: could not locate Games component");
let games = source.slice(gamesStart, gamesEnd);
const steamStart = games.indexOf('<div className="steam-card cursor-target">');
const pageClose = games.lastIndexOf("</Page>}");
if (steamStart === -1 || pageClose === -1 || pageClose < steamStart) throw new Error("fix-steam-card: could not locate Steam card");

const steamCard = `<div className="steam-card steam-card-wide cursor-target"><div className="steam-identity"><div className="steam-avatar-shell"><img className="steam-avatar" src={steam?.profile?.avatarfull||steam?.profile?.avatarmedium||steam?.profile?.avatar||""} onError={(e)=>{e.currentTarget.style.display="none"}} alt={\`\${steam?.profile?.personaname||"Steam"} avatar\`}/>{steam?.avatarFrame&&<img className="steam-avatar-frame" src={steam.avatarFrame} onError={(e)=>{e.currentTarget.style.display="none"}} alt="" aria-hidden="true"/>}<span className={\`steam-presence steam-state-\${steam?.onlineKey||"offline"}\`}/></div><div className="steam-name-wrap"><span className="kicker">STEAM PROFILE</span><h2>{steam?.profile?.personaname||"Steam"}</h2><small>{steam?.currentGame?\`Playing \${steam.currentGame.name}\`:steam?.onlineText||"offline"}{steam?.lastOnline&&!steam?.currentGame?\` · \${steam.lastOnline}\`:""}</small></div><a className="steam-profile-link" href={steam?.profile?.profileurl||"https://steamcommunity.com/"} target="_blank" rel="noreferrer">open profile <ExternalLink size={10}/></a></div><div className="steam-main"><div className="steam-recent"><div className="steam-recent-head"><span className="kicker">RECENTLY PLAYED</span><span>2 WEEKS</span></div>{steam?.recentGames?.length>0?<div className="steam-recent-row">{steam.recentGames.slice(0,3).map(game=><div className="steam-recent-item" key={game.appid}><img src={\`https://cdn.cloudflare.steamstatic.com/steam/apps/\${game.appid}/capsule_184x69.jpg\`} alt="" onError={(e)=>{e.currentTarget.style.display="none"}}/><div><strong>{game.name}</strong><small>{game.hours}h</small></div></div>)}</div>:<div className="steam-recent-empty">No recent games</div>}</div><div className="steam-data"><div className="steam-mini-stats"><div className="stat"><span>Games owned</span><b>{steam?.games??"—"}</b></div><div className="stat"><span>Total playtime</span><b>{steam?.playtime??"—"}</b></div><div className="stat"><span>Steam level</span><b>{steam?.level??"—"}</b></div><div className="stat"><span>Badges</span><b>{steam?.badges??"—"}</b></div><div className="stat"><span>Profile age</span><b>{steam?.age??"—"}</b></div></div></div></div></div>`;

games = games.slice(0, steamStart) + steamCard + games.slice(pageClose);
source = source.slice(0, gamesStart) + games + source.slice(gamesEnd);
fs.writeFileSync(mainPath, source);

const marker = "/* Steam profile wide card v1 */";
if (!styles.includes(marker)) {
  styles += `

${marker}
.steam-card-wide{padding:13px 14px;overflow:hidden}
.steam-identity{display:flex;align-items:center;gap:11px;min-width:0;padding-bottom:11px;border-bottom:1px solid #222229}
.steam-avatar-shell{position:relative;width:54px;height:54px;flex:0 0 auto}
.steam-avatar{width:54px;height:54px;display:block;border-radius:50%;object-fit:cover;border:1px solid #34343b;background:#17171c}
.steam-avatar-frame{position:absolute;inset:-8px;width:70px;height:70px;object-fit:contain;pointer-events:none;z-index:2}
.steam-presence{position:absolute;right:0;bottom:1px;width:11px;height:11px;border-radius:50%;border:2px solid #101014;background:#555;z-index:3}
.steam-state-online{background:#35d07f;box-shadow:0 0 9px #35d07f}.steam-state-ingame{background:#61d7a2;box-shadow:0 0 10px #61d7a2}.steam-state-away,.steam-state-snooze{background:#f0a21a}.steam-state-busy{background:#ed4a5a}.steam-state-offline{background:#555}
.steam-name-wrap{min-width:0;flex:1}.steam-name-wrap h2{font-size:15px;color:#ddd;font-weight:400;margin:3px 0}.steam-name-wrap small{display:block;font-size:8px;color:#555;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.steam-profile-link{display:flex;align-items:center;gap:4px;flex:0 0 auto;font-size:8px;color:#777;border:1px solid #292930;background:#141419;border-radius:5px;padding:6px 8px;transition:.2s}.steam-profile-link:hover{color:#fff;transform:translateY(-1px)}
.steam-main{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(180px,1fr);gap:12px;padding-top:12px;align-items:stretch}.steam-data{min-width:0;display:flex;flex-direction:column;justify-content:center}.steam-mini-stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}.steam-mini-stats .stat{min-width:0;padding:9px 8px}.steam-mini-stats .stat span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.steam-mini-stats .stat b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.steam-recent{border:1px solid #25252b;background:#0e0e12;border-radius:6px;padding:9px;min-width:0}.steam-recent-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px}.steam-recent-head>span:last-child{font-size:7px;color:#444}.steam-recent-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.steam-recent-item{min-width:0;display:flex;align-items:center;gap:6px;padding:5px;border:1px solid #202027;border-radius:4px;background:#101014}.steam-recent-item img{width:58px;height:22px;object-fit:cover;border-radius:2px;background:#18181d;flex:none}.steam-recent-item strong{display:block;font-size:7px;color:#bbb;font-weight:400;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.steam-recent-item small{display:block;font-size:6px;color:#555;margin-top:2px}.steam-recent-empty{font-size:8px;color:#555;padding:12px 2px}
@media(max-width:700px){.steam-card-wide{padding:11px}.steam-identity{gap:8px}.steam-avatar-shell{width:46px;height:46px}.steam-avatar{width:46px;height:46px}.steam-avatar-frame{inset:-7px;width:60px;height:60px}.steam-name-wrap h2{font-size:12px}.steam-profile-link{font-size:7px;padding:5px 6px}.steam-main{grid-template-columns:1fr;gap:8px}.steam-mini-stats{grid-template-columns:repeat(3,minmax(0,1fr))}.steam-recent-row{grid-template-columns:1fr}.steam-recent-item img{width:72px;height:27px}}
@media(max-width:500px){.steam-profile-link{display:none}.steam-mini-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.steam-recent-item img{width:82px;height:30px}}
`;
}
fs.writeFileSync(stylesPath, styles);
console.log("fix-steam-card: replaced Steam card with compact profile/recent/stats layout");
