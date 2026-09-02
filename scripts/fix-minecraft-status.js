import fs from "node:fs";

const path = "src/main.jsx";
const stylesPath = "src/styles.css";
let source = fs.readFileSync(path, "utf8");
let styles = fs.readFileSync(stylesPath, "utf8");
const status = '<span className="roblox-status-dot online"/><span className="roblox-status-text">in-game</span>';
if (source.includes(status)) {
  source = source.replace(status, "");
}

// Keep Lunar Client and Hypixel Bedwars as two equal-width compact stat boxes.
source = source.replace(
  '<div className="minecraft-secondary"><div className="minecraft-client">',
  '<div className="minecraft-secondary minecraft-secondary-split"><div className="minecraft-client minecraft-secondary-box">'
);
source = source.replace(
  '<div className="minecraft-bedwars">',
  '<div className="minecraft-bedwars minecraft-secondary-box">'
);
source = source.replaceAll('Client: <b>Lunar Client</b>', 'Client: <b>Lunar</b>');

const marker = "/* Minecraft secondary boxes v23 */";
if (!styles.includes(marker)) {
  styles += `

${marker}
.minecraft-secondary-split{width:100%;min-width:0;border:none!important;background:transparent!important;padding:0!important;display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:6px!important;overflow:hidden}
.minecraft-secondary-split .minecraft-secondary-box{width:100%;min-width:0;max-width:100%;height:42px;border:1px solid #25252b!important;background:#0e0e12!important;border-radius:5px;padding:6px 7px!important;box-sizing:border-box;overflow:hidden}
.minecraft-secondary-split .minecraft-client{min-width:0;width:100%}
.minecraft-secondary-split .minecraft-client-info{min-width:0;overflow:hidden}
.minecraft-secondary-split .minecraft-client-info span{max-width:100%;overflow:hidden;text-overflow:ellipsis}
.minecraft-secondary-split .minecraft-bedwars{min-width:0;width:100%;overflow:hidden;text-align:right}
.minecraft-secondary-split .minecraft-bedwars-head,.minecraft-secondary-split .minecraft-bedwars-grid{max-width:100%;overflow:hidden}
/* Match Hypixel Bedwars typography to the Lunar Client stat text. */
.minecraft-secondary-split .minecraft-bedwars-head{font-size:7px!important}
.minecraft-secondary-split .minecraft-bedwars-grid{gap:5px!important}
.minecraft-secondary-split .minecraft-bedwars-grid span{font-size:7px!important}
.minecraft-secondary-split .minecraft-bedwars-grid b{font-size:11px!important}
@media(max-width:700px){.minecraft-secondary-split{gap:5px!important}.minecraft-secondary-split .minecraft-secondary-box{height:38px;padding:5px 6px!important}.minecraft-secondary-split .minecraft-bedwars-head{font-size:6px!important}.minecraft-secondary-split .minecraft-bedwars-grid{gap:4px!important}.minecraft-secondary-split .minecraft-bedwars-grid span{font-size:6px!important}.minecraft-secondary-split .minecraft-bedwars-grid b{font-size:10px!important}}
`;
}

// Small visual alignment tweaks requested for the Minecraft card.
const tweakMarker = "/* Minecraft card micro alignment v25 */";
if (!styles.includes(tweakMarker)) {
  styles += `

${tweakMarker}
.minecraft-info .minecraft-created{transform:translateY(6px)}
.minecraft-info .minecraft-secondary-split .minecraft-client{transform:translate(3px,-3px)}
.minecraft-info .minecraft-secondary-split .minecraft-bedwars-grid b{font-size:8px!important}
@media(max-width:700px){.minecraft-info .minecraft-created{transform:translateY(6px)}.minecraft-info .minecraft-secondary-split .minecraft-client{transform:translate(3px,-3px)}.minecraft-info .minecraft-secondary-split .minecraft-bedwars-grid b{font-size:8px!important}}
`;
}

// Move Lunar Client stats 2px up from the previous 3px-down position.
const alignmentMarker = "/* Minecraft lunar alignment v27 */";
if (!styles.includes(alignmentMarker)) {
  styles += `

${alignmentMarker}
.minecraft-info .minecraft-secondary-split .minecraft-client{transform:translate(3px,1px)}
@media(max-width:700px){.minecraft-info .minecraft-secondary-split .minecraft-client{transform:translate(3px,1px)}}
`;
}

fs.writeFileSync(path, source);
fs.writeFileSync(stylesPath, styles);
console.log("fix-minecraft-status: fine-tuned Minecraft card stat positioning and Bedwars stat size");
