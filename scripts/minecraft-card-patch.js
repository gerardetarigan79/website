import fs from "node:fs";

const mainPath = "src/main.jsx";
const stylesPath = "src/styles.css";
let source = fs.readFileSync(mainPath, "utf8");
let styles = fs.readFileSync(stylesPath, "utf8");

const newCard = '<div className="game-card minecraft-card cursor-target"><div className="minecraft-visual"><img className="minecraft" src="https://mc-heads.net/body/iDraven/320" alt="iDraven Minecraft character"/><div className="minecraft-scan"/></div><div className="minecraft-info"><div className="minecraft-title-row"><div><span className="kicker">MINECRAFT</span><strong>iDraven</strong></div><a href="https://namemc.com/profile/iDraven.6" target="_blank" rel="noreferrer" aria-label="Open Minecraft profile">↗</a></div><div className="minecraft-stats"><div><b>3</b><span>Capes</span></div><div><b>Dec 19, 2021</b><span>Joined</span></div><div><b>Java</b><span>Edition</span></div></div><div className="minecraft-client"><img src="https://brand.lunarclient.com/_next/static/media/logo.87bbfcf3.svg" alt="Lunar Client"/><span>Client: <b>Lunar Client</b></span></div><div className="minecraft-bedwars"><div className="minecraft-bedwars-head"><span>HYPIXEL · BEDWARS</span><b>MVP+</b></div><div className="minecraft-bedwars-grid"><span><b>6.396</b>FKDR</span><span><b>2.133</b>WLR</span><span><b>13</b>LUNAR COSMETICS</span></div></div></div></div>';

const legacyRegex = /<GameCard\s+title=["']Minecraft["'][\s\S]*?<\/GameCard>/;
const generatedRegex = /<div\s+className=["']game-card minecraft-card cursor-target["'][\s\S]*?<\/div><\/div><\/div>/;
if (legacyRegex.test(source)) source = source.replace(legacyRegex, newCard);
else if (generatedRegex.test(source)) source = source.replace(generatedRegex, newCard);
else throw new Error("minecraft-card-patch: could not locate Minecraft card in src/main.jsx");

const marker = "/* Minecraft side-profile layout v5 */";
const css = `

${marker}
.game-grid{align-items:start}
.game-card.minecraft-card{height:auto;align-self:start;display:grid;grid-template-columns:42% 58%;min-height:220px;overflow:hidden}
.minecraft-visual{height:100%;min-height:220px;position:relative;display:grid;place-items:end center;overflow:hidden;background:radial-gradient(circle at 50% 45%,#17171d,#0b0b0f 74%)}
.minecraft-visual .minecraft{height:205px;width:auto;max-width:100%;object-fit:contain;filter:drop-shadow(0 18px 24px #000);transition:transform .28s cubic-bezier(.2,.8,.2,1)}
.minecraft-card:hover .minecraft-visual .minecraft{transform:translateY(-2px) scale(1.015)}
.minecraft-info{padding:13px 12px;min-width:0;display:flex;flex-direction:column;justify-content:flex-start}
.minecraft-title-row{display:flex;align-items:flex-end;justify-content:space-between;gap:8px}
.minecraft-title-row .kicker{display:block;font-size:5.5px;margin:0 0 2px}
.minecraft-title-row strong{display:block;color:#ddd;font-size:12px;font-weight:400}
.minecraft-title-row>a{color:#666;text-decoration:none}
.minecraft-stats{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:10px}
.minecraft-stats>div{min-width:0;border:1px solid #25252b;background:#0e0e12;border-radius:5px;padding:6px 5px}
.minecraft-stats b{display:block;color:#c7c7ce;font-size:7.5px;font-weight:400;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.minecraft-stats span{display:block;color:#555;font-size:4.5px;margin-top:2px}
.minecraft-client{display:flex;align-items:center;gap:5px;margin-top:8px;padding-top:7px;border-top:1px solid #222229;color:#555;font-size:5.5px}
.minecraft-client img{width:11px;height:11px;object-fit:contain;opacity:.8}
.minecraft-client b{color:#999;font-weight:400}
.minecraft-bedwars{margin-top:8px;padding-top:7px;border-top:1px solid #222229}
.minecraft-bedwars-head{display:flex;justify-content:space-between;align-items:center;color:#555;font-size:4.5px;letter-spacing:.04em}
.minecraft-bedwars-head b{color:#aaa;font-size:6.5px;font-weight:400}
.minecraft-bedwars-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:5px}
.minecraft-bedwars-grid span{display:flex;flex-direction:column;gap:2px;color:#555;font-size:4px}
.minecraft-bedwars-grid b{color:#aaa;font-size:7px;font-weight:400}
#games{align-items:flex-start;padding-top:42px}
@media(max-width:700px){.game-card.minecraft-card{grid-template-columns:40% 60%;min-height:200px}.minecraft-visual{min-height:200px}.minecraft-visual .minecraft{height:185px}.minecraft-info{padding:10px 9px}.minecraft-title-row strong{font-size:10px}.minecraft-stats{grid-template-columns:1fr 1fr;gap:4px;margin-top:7px}.minecraft-stats>div{padding:5px 4px}.minecraft-client{margin-top:6px;padding-top:5px}.minecraft-bedwars{margin-top:6px;padding-top:5px}}
`;
if (!styles.includes(marker)) styles += css;

fs.writeFileSync(mainPath, source);
fs.writeFileSync(stylesPath, styles);
console.log("minecraft-card-patch: reformatted Minecraft card to Roblox-style side-by-side layout");
