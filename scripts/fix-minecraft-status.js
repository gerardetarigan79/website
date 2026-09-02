import fs from "node:fs";

const path = "src/main.jsx";
const stylesPath = "src/styles.css";
let source = fs.readFileSync(path, "utf8");
let styles = fs.readFileSync(stylesPath, "utf8");
const status = '<span className="roblox-status-dot online"/><span className="roblox-status-text">in-game</span>';
if (source.includes(status)) {
  source = source.replace(status, "");
}

// Keep Lunar Client and Hypixel Bedwars as two distinct compact stat boxes.
source = source.replace(
  '<div className="minecraft-secondary"><div className="minecraft-client">',
  '<div className="minecraft-secondary minecraft-secondary-split"><div className="minecraft-client minecraft-secondary-box">'
);
source = source.replace(
  '<div className="minecraft-bedwars">',
  '<div className="minecraft-bedwars minecraft-secondary-box">'
);

const marker = "/* Minecraft secondary boxes v20 */";
if (!styles.includes(marker)) {
  styles += `\n\n${marker}\n.minecraft-secondary-split{border:none!important;background:transparent!important;padding:0!important;grid-template-columns:max-content max-content!important;gap:6px!important}\n.minecraft-secondary-split .minecraft-secondary-box{border:1px solid #25252b!important;background:#0e0e12!important;border-radius:5px;padding:6px 7px!important}\n@media(max-width:700px){.minecraft-secondary-split{gap:5px!important}.minecraft-secondary-split .minecraft-secondary-box{padding:5px 6px!important}}\n`;
}

fs.writeFileSync(path, source);
fs.writeFileSync(stylesPath, styles);
console.log("fix-minecraft-status: split Lunar Client and Hypixel Bedwars into separate boxes");
