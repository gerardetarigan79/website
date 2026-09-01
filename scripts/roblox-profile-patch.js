import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "src", "main.jsx");
let source = fs.readFileSync(file, "utf8");

if (!source.includes('import RobloxProfile from "./RobloxProfile";')) {
  source = source.replace('import LogoLoop from "./LogoLoop";', 'import LogoLoop from "./LogoLoop";\nimport RobloxProfile from "./RobloxProfile";');
}
if (!source.includes('import "./MinecraftProfile.css";')) {
  source = source.replace('import "./styles.css";', 'import "./styles.css";\nimport "./MinecraftProfile.css";');
}

const start = source.indexOf("function Games(){");
const end = source.indexOf("function GameCard(", start);
if (start === -1 || end === -1) throw new Error("Could not locate Games component in main.jsx");

const replacement = `function Games(){const[steam,setSteam]=useState(null),[mc,setMc]=useState(null);useEffect(()=>{fetch("/api/steam").then(r=>r.json()).then(setSteam).catch(()=>setSteam({error:true}));fetch("/api/minecraft").then(r=>r.json()).then(setMc).catch(()=>setMc({error:true}))},[]);const mcAge=mc?.accountAge?new Date(mc.accountAge):null;const mcAgeText=mcAge&&!Number.isNaN(mcAge.getTime())?\`since \${mcAge.toLocaleDateString("en-US",{month:"short",year:"numeric"})}\`:"Unknown";return <Page id="games" kicker="games & profiles" title="games"><p className="lead">a few places where i spend time when i'm not building things.</p><div className="game-grid"><RobloxProfile/><div className="game-card minecraft-card cursor-target"><div className="minecraft-visual"><img className="minecraft" src={mc?.render||"https://mc-api.bisai.dev/v1/render/3d/fullbody/iDraven"} alt="iDraven Minecraft character"/><div className="minecraft-scan"/></div><div className="minecraft-info"><div className="minecraft-title-row"><div><span className="kicker">MINECRAFT</span><strong>{mc?.username||"iDraven"}</strong></div><a href="https://namemc.com/profile/iDraven.6" target="_blank" rel="noreferrer" aria-label="Open Minecraft profile">↗</a></div><div className="minecraft-stats"><div><b>{mc?.capes??0}</b><span>Capes</span></div><div><b>{mcAgeText}</b><span>Account</span></div><div><b>Java</b><span>Edition</span></div></div><div className="minecraft-client"><img src="https://brand.lunarclient.com/_next/static/media/logo.87bbfcf3.svg" alt="Lunar Client"/><span>Client: <b>Lunar Client</b></span></div></div></div></div><div className="steam-card cursor-target"><div className="steam-head"><div><span className="kicker">STEAM</span><h2>chungusanimals</h2></div><a href="https://steamcommunity.com/id/chungusanimals/" target="_blank" rel="noreferrer">open profile <ExternalLink size={10}/></a></div>{steam&&!steam.error?<><div className="steam-stats">{["Games owned","Total playtime","Recent","Friends","Badges","Profile age"].map((label,i)=><Stat key={label} label={label} value={[steam.games,steam.playtime,steam.recent,steam.friends,steam.badges,steam.age][i]||""}/>)}</div></>:<div className="steam-unavailable"><Skeleton/><small>Steam profile data is unavailable right now.</small></div>}</div></Page>}\n`;

source = source.slice(0, start) + replacement + source.slice(end);
fs.writeFileSync(file, source);
console.log("Minecraft card now shows cape count, account age, Java edition, Lunar Client, and no BedWars stats");
`;
