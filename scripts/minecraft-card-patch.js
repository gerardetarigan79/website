import fs from "node:fs";

const mainPath = "src/main.jsx";
const stylesPath = "src/styles.css";
let source = fs.readFileSync(mainPath, "utf8");
let styles = fs.readFileSync(stylesPath, "utf8");

const oldCard = '<GameCard title="Minecraft" subtitle="iDraven" href="https://namemc.com/profile/iDraven.6"><img className="minecraft" src="https://mc-heads.net/body/iDraven/320" alt="Minecraft character"/></GameCard>';
const newCard = '<a className="game-card minecraft-card cursor-target" href="https://namemc.com/profile/iDraven.6" target="_blank" rel="noreferrer"><div className="game-visual minecraft-visual"><img className="minecraft" src="https://mc-heads.net/body/iDraven/320" alt="Minecraft character"/></div><div className="minecraft-info"><div className="minecraft-title-row"><div><span className="kicker">MINECRAFT</span><strong>iDraven</strong></div><ExternalLink size={11}/></div><div className="minecraft-stats"><div><b>3</b><span>CAPES</span></div><div><b>Dec 19, 2021</b><span>JOINED</span></div><div><b>Java</b><span>EDITION</span></div></div><div className="minecraft-client"><span className="minecraft-lunar-mark">◐</span><span>Client:</span><b>Lunar Client</b></div><div className="minecraft-bedwars"><div className="minecraft-bedwars-head"><span>HYPIXEL · BEDWARS</span><b>MVP+</b></div><div className="minecraft-bedwars-grid"><span><b>6.396</b>FKDR</span><span><b>2.133</b>WLR</span><span><b>13</b>LUNAR COSMETICS</span></div></div></div></a>';

if (source.includes(oldCard)) source = source.replace(oldCard, newCard);
else if (!source.includes('className="minecraft-card')) throw new Error("minecraft-card-patch: Minecraft card target not found");

const css = `

/* Minecraft profile card: hardcoded profile metadata requested for iDraven. */
.minecraft-card{display:block;min-width:0;overflow:hidden}
.minecraft-visual{height:150px;min-height:150px;position:relative;display:grid;place-items:center;overflow:hidden;background:radial-gradient(circle at 50% 45%,#14141a,#0b0b0f 72%)}
.minecraft-visual .minecraft{height:145px;width:auto;max-width:86%;object-fit:contain;filter:drop-shadow(0 18px 24px #000);transition:transform .28s cubic-bezier(.2,.8,.2,1)}
.minecraft-card:hover .minecraft-visual .minecraft{transform:translateY(-2px) scale(1.015)}
.minecraft-info{padding:9px}
.minecraft-title-row{display:flex;align-items:flex-end;justify-content:space-between;gap:8px}
.minecraft-title-row .kicker{display:block;font-size:5px;margin:0 0 2px}
.minecraft-title-row strong{display:block;color:#ddd;font-size:11px;font-weight:400}
.minecraft-title-row>svg{color:#666}
.minecraft-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-top:7px}
.minecraft-stats>div{min-width:0;border:1px solid #25252b;background:#0e0e12;border-radius:5px;padding:5px 4px}
.minecraft-stats b{display:block;color:#c7c7ce;font-size:7px;font-weight:400;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.minecraft-stats span{display:block;color:#555;font-size:4.5px;margin-top:2px}
.minecraft-client{display:flex;align-items:center;gap:4px;margin-top:7px;padding-top:6px;border-top:1px solid #222229;color:#555;font-size:5.5px}
.minecraft-client b{color:#999;font-weight:400}
.minecraft-lunar-mark{font-size:11px;color:#ddd;line-height:1}
.minecraft-bedwars{margin-top:6px;padding-top:6px;border-top:1px solid #222229}
.minecraft-bedwars-head{display:flex;justify-content:space-between;align-items:center;color:#555;font-size:4.5px;letter-spacing:.04em}
.minecraft-bedwars-head b{color:#aaa;font-size:6px;font-weight:400}
.minecraft-bedwars-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-top:4px}
.minecraft-bedwars-grid span{display:flex;flex-direction:column;gap:2px;color:#555;font-size:4px}
.minecraft-bedwars-grid b{color:#aaa;font-size:6px;font-weight:400}
@media(max-width:700px){.minecraft-visual{height:150px;min-height:150px}.minecraft-visual .minecraft{height:145px}.minecraft-info{padding:8px}.minecraft-stats{gap:3px}.minecraft-bedwars-grid{grid-template-columns:repeat(3,1fr)}}
`;
if (!styles.includes("/* Minecraft profile card: hardcoded profile metadata requested for iDraven. */")) styles += css;

fs.writeFileSync(mainPath, source);
fs.writeFileSync(stylesPath, styles);
console.log("minecraft-card-patch: applied hardcoded Minecraft profile metadata");
