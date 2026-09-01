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

const marker = "/* Minecraft compact layout override v3 */";
const css = `

${marker}
.game-grid{align-items:start}
.game-card.minecraft-card{height:auto;align-self:start}
.minecraft-visual{height:125px;min-height:125px}
.minecraft-visual .minecraft{height:118px}
.minecraft-info{padding:7px}
.minecraft-title-row{gap:6px}
.minecraft-title-row .kicker{font-size:4.5px;margin-bottom:1px}
.minecraft-title-row strong{font-size:10px}
.minecraft-stats{grid-template-columns:repeat(4,minmax(0,1fr));gap:3px;margin-top:5px}
.minecraft-stats>div{padding:4px 3px;border-radius:4px}
.minecraft-stats b{font-size:6.5px}
.minecraft-stats span{font-size:4px;margin-top:1px}
.minecraft-client{margin-top:5px;padding-top:4px;font-size:5px}
.minecraft-client img{width:10px;height:10px}
.minecraft-bedwars{margin-top:4px;padding-top:4px}
.minecraft-bedwars-head{font-size:4px}
.minecraft-bedwars-head b{font-size:5.5px}
.minecraft-bedwars-grid{gap:3px;margin-top:3px}
.minecraft-bedwars-grid span{gap:1px;font-size:3.5px}
.minecraft-bedwars-grid b{font-size:5.5px}
#games{align-items:flex-start;padding-top:58px}
@media(max-width:700px){#games{padding-top:48px}.minecraft-visual{height:120px;min-height:120px}.minecraft-visual .minecraft{height:113px}.minecraft-info{padding:7px}.minecraft-stats{grid-template-columns:repeat(4,minmax(0,1fr))}}
`;
if (!styles.includes(marker)) styles += css;

fs.writeFileSync(mainPath, source);
fs.writeFileSync(stylesPath, styles);
console.log("minecraft-card-patch: compacted Minecraft card, stopped Roblox height stretching, and improved Games entry visibility");
