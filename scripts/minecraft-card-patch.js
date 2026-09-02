import fs from "node:fs";

const mainPath = "src/main.jsx";
const stylesPath = "src/styles.css";
let source = fs.readFileSync(mainPath, "utf8");
let styles = fs.readFileSync(stylesPath, "utf8");

// Rebuild the Minecraft card with the exact same header structure/classes used by Roblox.
// This keeps the divider, title baseline, and profile button geometry in sync instead of
// maintaining a second, slightly different header implementation.
const newCard = '<div className="game-card minecraft-card cursor-target"><div className="roblox-profile-head minecraft-header"><div><span className="kicker">MINECRAFT PROFILE</span><div className="roblox-name-row minecraft-name-row"><h2>iDraven</h2></div><small className="roblox-display-name minecraft-display-name">Java Edition</small></div><a className="roblox-open" href="https://namemc.com/profile/iDraven.6" target="_blank" rel="noreferrer">open profile <ExternalLink size={11}/></a></div><div className="minecraft-body"><div className="minecraft-visual"><div className="minecraft-avatar-wrap"><img className="minecraft" src="/minecraft/idraven.png" alt="iDraven Minecraft character"/><div className="minecraft-scan"/></div></div><div className="minecraft-info"><div className="minecraft-stats"><div><b>3</b><span>Capes</span></div><div><b>Dec 19, 2021</b><span>Joined</span></div><div><b>Java</b><span>Edition</span></div></div><div className="minecraft-hypixel"><span>HYPIXEL RANK</span><b>MVP+</b></div><div className="minecraft-client"><img src="https://brand.lunarclient.com/_next/static/media/logo.87bbfcf3.svg" alt="Lunar Client"/><span>Client: <b>Lunar Client</b></span></div><div className="minecraft-bedwars"><div className="minecraft-bedwars-head"><span>BEDWARS</span></div><div className="minecraft-bedwars-grid"><span><b>6.396</b>FKDR</span><span><b>2.133</b>WLR</span><span><b>13</b>LUNAR COSMETICS</span></div></div></div></div></div>';

const legacyRegex = /<GameCard\s+title=["']Minecraft["'][\s\S]*?<\/GameCard>/;
const generatedRegex = /<div\s+className=["']game-card minecraft-card cursor-target["'][\s\S]*?<\/div><\/div><\/div>/;
if (legacyRegex.test(source)) source = source.replace(legacyRegex, newCard);
else if (generatedRegex.test(source)) source = source.replace(generatedRegex, newCard);
else throw new Error("minecraft-card-patch: could not locate Minecraft card in src/main.jsx");

const marker = "/* Minecraft Roblox-style profile layout v14 */";
const css = `

${marker}
.game-grid{align-items:stretch}
.game-card.minecraft-card{height:100%;min-height:0;align-self:stretch;display:flex;flex-direction:column;overflow:hidden}
/* Exact Roblox header geometry/typography: same padding, kicker, name, divider and button. */
.minecraft-header{flex:none;display:flex;justify-content:space-between;align-items:flex-start;padding:8px 10px;border-bottom:1px solid #222229;min-height:0}
.minecraft-header .kicker{font-size:10px;color:#505056;margin-bottom:8px;letter-spacing:.04em}
.minecraft-name-row{display:flex;align-items:center;gap:5px}
.minecraft-name-row h2{font-family:VideoMed,sans-serif;font-size:13px;font-weight:400;color:#eee;margin:1px 0 0}
.minecraft-display-name{display:block;color:#555;font-size:6px;margin-top:2px}
.minecraft-open{white-space:nowrap}
.minecraft-header .roblox-open{transform:scale(1.02);transform-origin:top right}
.minecraft-body{flex:1;min-height:0;display:grid;grid-template-columns:44% 56%;background:transparent!important}
.minecraft-visual{height:100%;min-height:0;position:relative;display:flex;overflow:hidden;background:transparent!important;padding:0 10px}
.minecraft-avatar-wrap{flex:1;min-height:0;display:grid;place-items:end center;position:relative;background:transparent!important}
.minecraft-visual .minecraft{display:block;width:auto;height:calc(100% - 4px);max-height:220px;max-width:100%;object-fit:contain;background:transparent!important;filter:drop-shadow(0 18px 24px #000);mix-blend-mode:normal;transition:transform .28s cubic-bezier(.2,.8,.2,1);align-self:end}
.minecraft-card:hover .minecraft-visual .minecraft{transform:translateY(-2px) scale(1.015)}
.minecraft-info{padding:12px 13px;min-width:0;display:flex;flex-direction:column;justify-content:center;background:transparent}
.minecraft-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.minecraft-stats>div{min-width:0;border:1px solid #25252b;background:#0e0e12;border-radius:5px;padding:9px 7px}
.minecraft-stats b{display:block;color:#c7c7ce;font-size:12px;font-weight:400;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.1}
.minecraft-stats span{display:block;color:#666;font-size:7px;margin-top:3px}
.minecraft-hypixel{display:flex;align-items:center;justify-content:space-between;margin-top:9px;padding:9px 8px;border:1px solid #25252b;background:#0e0e12;border-radius:5px;color:#666;font-size:7px}
.minecraft-hypixel b{color:#aaa;font-size:12px;font-weight:400}
.minecraft-client{display:flex;align-items:center;gap:6px;margin-top:9px;padding-top:8px;border-top:1px solid #222229;color:#666;font-size:7px}
.minecraft-client img{width:14px;height:14px;object-fit:contain;opacity:.85}
.minecraft-client b{color:#999;font-weight:400}
.minecraft-bedwars{margin-top:9px;padding-top:8px;border-top:1px solid #222229}
.minecraft-bedwars-head{color:#666;font-size:7px;letter-spacing:.05em}
.minecraft-bedwars-grid{display:grid;grid-template-columns:1fr 1fr 1.25fr;gap:6px;margin-top:6px}
.minecraft-bedwars-grid span{display:flex;flex-direction:column;gap:3px;color:#666;font-size:6px}
.minecraft-bedwars-grid b{color:#aaa;font-size:12px;font-weight:400;line-height:1.1}
#games{align-items:flex-start;padding-top:42px}
@media(max-width:700px){.minecraft-header{gap:8px}.minecraft-header .kicker{font-size:10px;margin-bottom:8px}.minecraft-name-row h2{font-size:13px}.minecraft-display-name{font-size:6px}.game-card.minecraft-card{height:100%}.minecraft-body{grid-template-columns:42% 58%}.minecraft-visual{padding:0 7px}.minecraft-info{padding:9px 8px}.minecraft-stats{grid-template-columns:1fr 1fr;gap:4px}.minecraft-stats>div{padding:7px 5px}.minecraft-stats>div:nth-child(3){grid-column:1/-1}.minecraft-stats b,.minecraft-hypixel b,.minecraft-bedwars-grid b{font-size:10px}.minecraft-stats span,.minecraft-hypixel,.minecraft-client,.minecraft-bedwars-head{font-size:6px}.minecraft-bedwars-grid{grid-template-columns:1fr 1fr 1fr;gap:4px}.minecraft-bedwars-grid span{font-size:5px}}
`;
if (!styles.includes(marker)) styles += css;

fs.writeFileSync(mainPath, source);
fs.writeFileSync(stylesPath, styles);
console.log("minecraft-card-patch: v15 - exact Roblox header geometry, matching button size, and shared ExternalLink icon");
