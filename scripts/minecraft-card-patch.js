import fs from "node:fs";

const mainPath = "src/main.jsx";
const stylesPath = "src/styles.css";
let source = fs.readFileSync(mainPath, "utf8");
let styles = fs.readFileSync(stylesPath, "utf8");

const newCard = '<div className="game-card minecraft-card cursor-target"><div className="minecraft-visual"><div className="minecraft-avatar-title"><span className="kicker">MINECRAFT</span><strong>iDraven</strong><a href="https://namemc.com/profile/iDraven.6" target="_blank" rel="noreferrer" aria-label="Open Minecraft profile">↗</a></div><div className="minecraft-avatar-wrap"><img className="minecraft" src="https://mc-api.bisai.dev/v1/render/3d/fullbody/iDraven" alt="iDraven Minecraft character"/><div className="minecraft-scan"/></div></div><div className="minecraft-info"><div className="minecraft-stats"><div><b>3</b><span>Capes</span></div><div><b>Dec 19, 2021</b><span>Joined</span></div><div><b>Java</b><span>Edition</span></div></div><div className="minecraft-hypixel"><span>HYPIXEL</span><b>MVP+</b></div><div className="minecraft-client"><img src="https://brand.lunarclient.com/_next/static/media/logo.87bbfcf3.svg" alt="Lunar Client"/><span>Client: <b>Lunar Client</b></span></div><div className="minecraft-bedwars"><div className="minecraft-bedwars-head"><span>BEDWARS</span></div><div className="minecraft-bedwars-grid"><span><b>6.396</b>FKDR</span><span><b>2.133</b>WLR</span><span><b>13</b>LUNAR COSMETICS</span></div></div></div></div>';

const legacyRegex = /<GameCard\s+title=["']Minecraft["'][\s\S]*?<\/GameCard>/;
const generatedRegex = /<div\s+className=["']game-card minecraft-card cursor-target["'][\s\S]*?<\/div><\/div><\/div>/;
if (legacyRegex.test(source)) source = source.replace(legacyRegex, newCard);
else if (generatedRegex.test(source)) source = source.replace(generatedRegex, newCard);
else throw new Error("minecraft-card-patch: could not locate Minecraft card in src/main.jsx");

const marker = "/* Minecraft Roblox-style profile layout v6 */";
const css = `

${marker}
.game-grid{align-items:stretch}
.game-card.minecraft-card{height:100%;min-height:0;align-self:stretch;display:grid;grid-template-columns:44% 56%;overflow:hidden}
.minecraft-visual{height:100%;min-height:0;position:relative;display:flex;flex-direction:column;overflow:hidden;background:radial-gradient(circle at 50% 52%,#17171d,#0b0b0f 74%);padding:12px 10px 0}
.minecraft-avatar-title{display:flex;align-items:center;gap:6px;position:relative;z-index:2;min-height:26px;padding:0 3px}
.minecraft-avatar-title .kicker{font-size:6px;margin:0;color:#666}
.minecraft-avatar-title strong{font-size:13px;font-weight:400;color:#ddd;line-height:1}
.minecraft-avatar-title>a{margin-left:auto;color:#666;text-decoration:none;font-size:11px;line-height:1}
.minecraft-avatar-wrap{flex:1;min-height:0;display:grid;place-items:end center;position:relative}
.minecraft-visual .minecraft{width:auto;height:calc(100% - 4px);max-height:205px;max-width:100%;object-fit:contain;filter:drop-shadow(0 18px 24px #000);transition:transform .28s cubic-bezier(.2,.8,.2,1)}
.minecraft-card:hover .minecraft-visual .minecraft{transform:translateY(-2px) scale(1.015)}
.minecraft-info{padding:14px 13px;min-width:0;display:flex;flex-direction:column;justify-content:center}
.minecraft-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.minecraft-stats>div{min-width:0;border:1px solid #25252b;background:#0e0e12;border-radius:5px;padding:8px 6px}
.minecraft-stats b{display:block;color:#c7c7ce;font-size:10px;font-weight:400;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.1}
.minecraft-stats span{display:block;color:#555;font-size:5.5px;margin-top:3px}
.minecraft-hypixel{display:flex;align-items:center;justify-content:space-between;margin-top:9px;padding:8px 7px;border:1px solid #25252b;background:#0e0e12;border-radius:5px;color:#555;font-size:6px}
.minecraft-hypixel b{color:#aaa;font-size:10px;font-weight:400}
.minecraft-client{display:flex;align-items:center;gap:6px;margin-top:9px;padding-top:8px;border-top:1px solid #222229;color:#555;font-size:6px}
.minecraft-client img{width:13px;height:13px;object-fit:contain;opacity:.85}
.minecraft-client b{color:#999;font-weight:400}
.minecraft-bedwars{margin-top:9px;padding-top:8px;border-top:1px solid #222229}
.minecraft-bedwars-head{color:#555;font-size:6px;letter-spacing:.05em}
.minecraft-bedwars-grid{display:grid;grid-template-columns:1fr 1fr 1.25fr;gap:6px;margin-top:6px}
.minecraft-bedwars-grid span{display:flex;flex-direction:column;gap:3px;color:#555;font-size:5px}
.minecraft-bedwars-grid b{color:#aaa;font-size:10px;font-weight:400;line-height:1.1}
#games{align-items:flex-start;padding-top:42px}
@media(max-width:700px){.game-card.minecraft-card{grid-template-columns:42% 58%;height:100%}.minecraft-visual{padding:10px 7px 0}.minecraft-avatar-title strong{font-size:11px}.minecraft-avatar-title .kicker{font-size:5px}.minecraft-info{padding:10px 8px}.minecraft-stats{grid-template-columns:1fr 1fr;gap:4px}.minecraft-stats>div{padding:6px 5px}.minecraft-stats>div:nth-child(3){grid-column:1/-1}.minecraft-hypixel,.minecraft-client,.minecraft-bedwars{margin-top:7px}.minecraft-bedwars-grid{grid-template-columns:1fr 1fr 1fr;gap:4px}}
`;
if (!styles.includes(marker)) styles += css;

fs.writeFileSync(mainPath, source);
fs.writeFileSync(stylesPath, styles);
console.log("minecraft-card-patch: matched Minecraft card height to Roblox, moved username above avatar, enlarged text, and restored cape-capable 3D render");
