import fs from "node:fs";

const path = "src/main.jsx";
let source = fs.readFileSync(path, "utf8");
const status = '<span className="roblox-status-dot online"/><span className="roblox-status-text">in-game</span>';
if (source.includes(status)) {
  source = source.replace(status, "");
  fs.writeFileSync(path, source);
}
console.log("fix-minecraft-status: Minecraft has no Roblox presence/status indicator");
