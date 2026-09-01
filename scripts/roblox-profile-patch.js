import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "src", "main.jsx");
let source = fs.readFileSync(file, "utf8");

if (!source.includes('import RobloxProfile from "./RobloxProfile";')) {
  source = source.replace('import LogoLoop from "./LogoLoop";', 'import LogoLoop from "./LogoLoop";\nimport RobloxProfile from "./RobloxProfile";');
}

const start = source.indexOf("function Games(){");
const end = source.indexOf("function GameCard(", start);
if (start === -1 || end === -1) throw new Error("Could not locate Games component in main.jsx");

const replacement = `function Games(){const[steam,setSteam]=useState(null);useEffect(()=>{fetch("/api/steam").then(r=>r.json()).then(setSteam).catch(()=>setSteam({error:true}))},[]);return <Page id="games" kicker="games & profiles" title="games"><p className="lead">a few places where i spend time when i'm not building things.</p><div className="game-grid"><RobloxProfile/><GameCard title="Minecraft" subtitle="iDraven" href="https://namemc.com/profile/iDraven.6"><img className="minecraft" src="https://mc-heads.net/body/iDraven/320" alt="Minecraft character"/></GameCard></div><div className="steam-card cursor-target"><div className="steam-head"><div><span className="kicker">STEAM</span><h2>chungusanimals</h2></div><a href="https://steamcommunity.com/id/chungusanimals/" target="_blank" rel="noreferrer">open profile <ExternalLink size={10}/></a></div>{steam&&!steam.error?<><div className="steam-stats">{["Games owned","Total playtime","Recent","Friends","Badges","Profile age"].map((label,i)=><Stat key={label} label={label} value={[steam.games,steam.playtime,steam.recent,steam.friends,steam.badges,steam.age][i]||""}/>)}</div></>:<div className="steam-unavailable"><Skeleton/><small>Steam profile data is unavailable right now.</small></div>}</div></Page>}
`;

source = source.slice(0, start) + replacement + source.slice(end);
fs.writeFileSync(file, source);
console.log("Roblox and Minecraft cards wired into a shared two-column Games grid");
