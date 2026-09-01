import fs from "node:fs";

const mainPath = "src/main.jsx";
const stylesPath = "src/styles.css";
let source = fs.readFileSync(mainPath, "utf8");
let styles = fs.readFileSync(stylesPath, "utf8");

const newCard = '<div className="game-card minecraft-card cursor-target"><div className="minecraft-visual"><img className="minecraft" src="https://mc-heads.net/body/iDraven/320" alt="iDraven Minecraft character"/><div className="minecraft-scan"/></div><div className="minecraft-info"><div className="minecraft-title-row"><div><span className="kicker">MINECRAFT</span><strong>iDraven</strong></div><a href="https://namemc.com/profile/iDraven.6" target="_blank" rel="noreferrer" aria-label="Open Minecraft profile">↗</a></div><div className="minecraft-stats"><div><b>3</b><span>Capes</span></div><div><b>Dec 19, 2021</b><span>Joined</span></div><div><b>Java</b><span>Edition</span></div></div><div className="minecraft-client"><img src="https://brand.lunarclient.com/_next/static/media/logo.87bbfcf3.svg" alt="Lunar Client"/><span>Client: <b>Lunar Client</b></span></div><div className="minecraft-bedwars"><div className="minecraft-bedwars-head"><span>HYPIXEL · BEDWARS</span><b>MVP+</b></div><div className="minecraft-bedwars-grid"><span><b>6.396</b>FKDR</span><span><b>2.133</b>WLR</span><span><b>13</b>LUNAR COSMETICS</span></div></div></div></div>';

// roblox-profile-patch.js runs immediately before this script and generates the
// current Minecraft card as a div. Match that generated card as well as the
// original GameCard so this build step cannot fail when the earlier patch runs.
const legacyRegex = /<GameCard\s+title=["']Minecraft["'][\s\S]*?<\/GameCard>/;
const generatedRegex = /<div\s+className=["']game-card minecraft-card cursor-target["'][\s\S]*?<\/div><\/div><\/div>/;
if (legacyRegex.test(source)) {
  source = source.replace(legacyRegex, newCard);
} else if (generatedRegex.test(source)) {
  source = source.replace(generatedRegex, newCard);
} else {
  throw new Error("minecraft-card-patch: could not locate Minecraft card in src/main.jsx");
}

const marker = "/* Minecraft profile card: hardcoded profile metadata requested for iDraven. */";
const css = `

${marker}
.minecraft-card{display:block;min-width:0;overflow:hidden}
.minecraft-visual{height:150px;min-height:150px;position:relative;display:grid;place-items:center;overflow:hidden;background:radial-gradient(circle at 50% 45%,#14141a,#0b0b0f 72%)}
.minecraft-visual .minecraft{height:145px;width:auto;max-width:86%;object-fit:contain;filter:drop-shadow(0 18px 24px #000);transition:transform .28s cubic-bezier(.2,.8,.2,1)}
.minecraft-card:hover .minecraft-visual .minecraft{transform:translateY(-2px) scale(1.015)}
.minecraft-info{padding:9px}
.minecraft-title-row{display:flex;align-items:flex-end;justify-content:space-between;gap:8px}
.minecraft-title-row .kicker{display:block;font-size:5px;margin:0 0 2px}
.minecraft-title-row strong{display:block;color:#ddd;font-size:11px;font-weight:400}
.minecraft-title-row>a{color:#666;text-decoration:none}
.minecraft-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-top:7px}
.minecraft-stats>div{min-width:0;border:1px solid #25252b;background:#0e0e12;border-radius:5px;padding:5px 4px}
.minecraft-stats b{display:block;color:#c7c7ce;font-size:7px;font-weight:400;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.minecraft-stats span{display:block;color:#555;font-size:4.5px;margin-top:2px}
.minecraft-client{display:flex;align-items:center;gap:4px;margin-top:7px;padding-top:6px;border-top:1px solid #222229;color:#555;font-size:5.5px}
.minecraft-client img{width:11px;height:11px;object-fit:contain;opacity:.8}
.minecraft-client b{color:#999;font-weight:400}
.minecraft-bedwars{margin-top:6px;padding-top:6px;border-top:1px solid #222229}
.minecraft-bedwars-head{display:flex;justify-content:space-between;align-items:center;color:#555;font-size:4.5px;letter-spacing:.04em}
.minecraft-bedwars-head b{color:#aaa;font-size:6px;font-weight:400}
.minecraft-bedwars-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-top:4px}
.minecraft-bedwars-grid span{display:flex;flex-direction:column;gap:2px;color:#555;font-size:4px}
.minecraft-bedwars-grid b{color:#aaa;font-size:6px;font-weight:400}
@media(max-width:700px){.minecraft-visual{height:150px;min-height:150px}.minecraft-visual .minecraft{height:145px}.minecraft-info{padding:8px}.minecraft-stats{gap:3px}.minecraft-bedwars-grid{grid-template-columns:repeat(3,1fr)}}
`;
if (!styles.includes(marker)) styles += css;

fs.writeFileSync(mainPath, source);
fs.writeFileSync(stylesPath, styles);
console.log("minecraft-card-patch: fixed build ordering and enforced requested Minecraft metadata");
