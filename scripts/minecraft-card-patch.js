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

const marker = "/* Minecraft compact layout override v4 */";
const css = `

${marker}
.game-grid{align-items:start}
.game-card.minecraft-card{height:auto;align-self:start}
.minecraft-visual{height:145px;min-height:145px}
.minecraft-visual .minecraft{height:138px}
.minecraft-info{padding:10px}
.minecraft-title-row{gap:8px}
.minecraft-title-row .kicker{font-size:5.5px;margin-bottom:2px}
.minecraft-title-row strong{font-size:12px}
.minecraft-stats{grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin-top:8px}
.minecraft-stats>div{padding:6px 5px;border-radius:5px}
.minecraft-stats b{font-size:8px}
.minecraft-stats span{font-size:5px;margin-top:2px}
.minecraft-client{margin-top:8px;padding-top:7px;font-size:6px}
.minecraft-client img{width:12px;height:12px}
.minecraft-bedwars{margin-top:7px;padding-top:7px}
.minecraft-bedwars-head{font-size:5px}
.minecraft-bedwars-head b{font-size:7px}
.minecraft-bedwars-grid{grid-template-columns:1fr 1fr 1.4fr;gap:5px;margin-top:5px}
.minecraft-bedwars-grid span{gap:2px;font-size:5px}
.minecraft-bedwars-grid b{font-size:7px}
#games{align-items:flex-start;padding-top:50px}
@media(max-width:700px){#games{padding-top:42px}.minecraft-visual{height:135px;min-height:135px}.minecraft-visual .minecraft{height:128px}.minecraft-info{padding:9px}.minecraft-stats{gap:4px}.minecraft-bedwars-grid{grid-template-columns:1fr 1fr 1.3fr}}
`;
if (!styles.includes(marker)) styles += css;

fs.writeFileSync(mainPath, source);
fs.writeFileSync(stylesPath, styles);
console.log("minecraft-card-patch: reformatted Minecraft card with breathing room and compact grouped stats");
