import fs from "node:fs";

// Canonical build-time wiring for the current portfolio sections.
const path = "src/main.jsx";
let source = fs.readFileSync(path, "utf8");

const asciiImport = 'import ASCIIText from "./ASCIIText";';
if (!source.includes('import RecentPlaysCarousel from "./RecentPlaysCarousel";')) source = source.replace(asciiImport, `${asciiImport}\nimport RecentPlaysCarousel from "./RecentPlaysCarousel";`);
if (!source.includes('import CountUp from "./CountUp";')) source = source.replace(asciiImport, `${asciiImport}\nimport CountUp from "./CountUp";`);

const musicStart = source.indexOf("function Music()");
const musicEnd = source.indexOf("function Stat(", musicStart);
if (musicStart === -1 || musicEnd === -1) throw new Error("prepare-build: could not find Music block");
const musicReplacement = `function Music(){const [data,setData]=useState({recent:[],artists:[],albums:[],info:null}),[loading,setLoading]=useState(true);const load=async()=>{try{const [recent,artists,albums,info]=await Promise.all([lastfm("recent"),lastfm("artists"),lastfm("albums"),lastfm("info")]);setData({recent:recent.recenttracks?.track||[],artists:artists.topartists?.artist||[],albums:albums.topalbums?.album||[],info:info.user||null})}catch(e){}finally{setLoading(false)}};useEffect(()=>{load();const id=setInterval(load,15000);return()=>clearInterval(id)},[]);return <Page id="music" kicker="what i've been listening to" title="music"><p className="lead">live listening data from <b>Last.fm</b>, updated automatically.</p><div className="music-stats"><Stat label="Scrobbles" value={data.info?fmtNum(data.info.playcount):""}/><Stat label="Artists" value={data.info?fmtNum(data.info.artist_count):""}/><Stat label="Last.fm user" value={LASTFM_USER}/></div><div className="music-layout"><MusicList title="TOP ARTISTS · 30D" items={data.artists.slice(0,5).map(x=>({name:x.name,meta:x.playcount}))}/><div className="now-playing cursor-target"><div className="music-heading">✦ RECENT PLAYS ✦</div>{loading?<Skeleton/>:<RecentPlaysCarousel tracks={data.recent}/>}</div><MusicList title="TOP ALBUMS · 30D" items={data.albums.slice(0,6).map(x=>({name:x.name,meta:x.artist?.name}))}/></div></Page>}`;
source = source.slice(0, musicStart) + musicReplacement + "\n" + source.slice(musicEnd);

const projectsStart = source.indexOf("function Projects()");
const projectsEnd = source.indexOf("function Skills(", projectsStart);
if (projectsStart === -1 || projectsEnd === -1) throw new Error("prepare-build: could not find Projects block in src/main.jsx");
const projectsReplacement = `function Projects(){const projects=[{name:"Doxa Dock",subtitle:"private user application",description:"Lightweight client utility and automation dashboard I built to give me deeper control over account workflows. It streamlines daily tasks with custom scripts, real-time activity logging, and tailored profile.",logo:"/projects/doxa.png",className:"doxa"},{name:"Vanta Flow",subtitle:"After Effects workflow plugin",description:"An After Effects plugin built around essential tools, shortcuts, presets, and workflow utilities to make editing faster and more efficient.",logo:"/projects/vanta.png",className:"vanta"},{name:"Argo Node",subtitle:"Discord utility bot",description:"discord utility bot i made for fun",logo:"/projects/argo.png",className:"argo"}];return <Page id="projects" kicker="my work" title="projects"><p className="lead">projects i build to improve my workflow.</p><div className="projects-grid">{projects.map(project=><div className={\`project-card project-card-\${project.className} cursor-target\`} key={project.name}><div className="project-logo-wrap"><img className="project-logo" src={project.logo} alt={project.name}/></div><div className="project-body"><div className="project-brand"><span>{project.name}</span></div><h2>{project.subtitle}</h2><p>{project.description}</p></div></div>)}</div></Page>}`;
source = source.slice(0, projectsStart) + projectsReplacement + "\n" + source.slice(projectsEnd);

const canonicalProjects = source.slice(source.indexOf("function Projects()"), source.indexOf("function Skills(", source.indexOf("function Projects()")));
if (!canonicalProjects.includes('name:"Doxa Dock"') || !canonicalProjects.includes('name:"Vanta Flow"') || !canonicalProjects.includes('name:"Argo Node"') || canonicalProjects.includes("doxa-preview") || canonicalProjects.includes("view project") || !canonicalProjects.includes("projects-grid")) {
  throw new Error("prepare-build: Projects section is not canonical");
}

const start = source.indexOf("function Entry({onEnter}");
const endMarker = "createRoot(document.getElementById(\"root\")).render(<App/>);";
const end = source.indexOf(endMarker, start);
if (start === -1 || end === -1) throw new Error("prepare-build: could not find Entry/App block in src/main.jsx");
const replacement = `function Entry({onEnter, exiting}){const [ready,setReady]=useState(false);useEffect(()=>{const t=setTimeout(()=>setReady(true),600);return()=>clearTimeout(t)},[]);return <div className={\`entry\${ready?" ready":""}\${exiting?" exiting":""}\`} onClick={onEnter} onKeyDown={e=>{if(e.key==="Enter"||e.key===" ")onEnter()}} tabIndex="0"><div className="entry-stars">✦</div><div className="entry-title"><ASCIIText text="Draven" enableWaves={true} asciiFontSize={8}/></div><div className="entry-sub">press anything to enter</div><div className="entry-line"/></div>}
function Views(){const [views,setViews]=useState(null);useEffect(()=>{let cancelled=false;fetch("/api/views",{method:"POST",headers:{Accept:"application/json"}}).then(async r=>{if(!r.ok)throw new Error("Views API returned " + r.status);const x=await r.json();if(typeof x.views!=="number")throw new Error("Views API returned no count");if(!cancelled)setViews(x.views)}).catch(()=>{try{const k="draven-local-views";const v=Number(localStorage.getItem(k)||"0")+1;localStorage.setItem(k,String(v));if(!cancelled)setViews(v)}catch{if(!cancelled)setViews(0)}});return()=>{cancelled=true}},[]);return <div className="views">◉ {views==null?"":fmtNum(views)}</div>}
function App(){const [entryVisible,setEntryVisible]=useState(()=>sessionStorage.getItem("draven-entered")!=="1");const [entryExiting,setEntryExiting]=useState(false);const [active,setActive]=useState("home");useEffect(()=>{const sync=()=>{const hash=window.location.hash.replace("#","");if(PAGES.includes(hash))setActive(hash)};sync();const io=new IntersectionObserver(es=>{const visible=es.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible)setActive(visible.target.id)},{rootMargin:"-42% 0px -42% 0px",threshold:[0,.2,.5,1]});PAGES.forEach(id=>{const el=document.getElementById(id);if(el)io.observe(el)});window.addEventListener("hashchange",sync);return()=>{io.disconnect();window.removeEventListener("hashchange",sync)}},[]);const enter=()=>{if(entryExiting)return;sessionStorage.setItem("draven-entered","1");setEntryExiting(true);setTimeout(()=>setEntryVisible(false),700)};const navigate=id=>{setActive(id);window.history.replaceState(null,"","#"+id);requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"}))};const cursor=<TargetCursor targetSelector="a, button, [role='button'], .cursor-target" spinDuration={2} hideDefaultCursor={true} parallaxOn={true}/>;const background=<><LightRays raysOrigin="top-center" raysColor="#00ffff" raysSpeed={1.5} lightSpread={0.8} rayLength={1.2} followMouse={true} mouseInfluence={0.1} noiseAmount={0.1} distortion={0.05} className="custom-rays" pulsating /></>;return <>{background}{cursor}{entryVisible&&<Entry onEnter={enter} exiting={entryExiting}/>}<aside className="option-wheel-sidebar"><OptionWheel items={NAV.map(([_,label])=>label)} defaultSelected={PAGES.indexOf(active)} textColor="#a6a6a6" activeColor="#ffffff" side="left" fontSize={3} spacing={1.4} curve={1} tilt={6} blur={2} fade={0.25} smoothing={200} inset={18} loop={false} draggable soundUrl="/audio/soundclick.mp3" soundVolume={0.5} onChange={(index)=>navigate(PAGES[index])}/></aside><main className="site">{PAGES.map(id=>({home:<Home/>,music:<Music/>,projects:<Projects/>,skills:<Skills/>,setup:<Setup/>,games:<Games/>,f1:<F1/>,biolinks:<Biolinks/>,contact:<Contact/>}[id]))}</main>{!entryVisible&&<Views/>}</>}
createRoot(document.getElementById("root")).render(<App/>);`;
source = source.slice(0, start) + replacement + "\n";
fs.writeFileSync(path, source);

const stylesPath = "src/styles.css";
let styles = fs.readFileSync(stylesPath, "utf8");
const carouselStyles = `

/* Recent Plays: 15-track 3D carousel with Last.fm boundary cards. */
.recent-carousel{position:relative;height:420px;overflow:hidden;outline:none;touch-action:pan-y;cursor:grab;perspective:1200px;user-select:none}
.recent-carousel.is-dragging{cursor:grabbing}
.recent-carousel-track{position:absolute;inset:0;transform-style:preserve-3d}
.recent-card{position:absolute;left:50%;top:22px;width:235px;height:350px;transform-style:preserve-3d;transform-origin:center center;transition:transform .55s cubic-bezier(.2,.75,.2,1),opacity .45s ease;will-change:transform,opacity}
.recent-art-wrap{position:relative;width:235px;height:265px;display:grid;place-items:center;transform-style:preserve-3d}
.recent-cd{position:absolute;width:245px;height:245px;border-radius:50%;background-size:cover;background-position:center;filter:brightness(.45) saturate(.8);box-shadow:0 22px 45px #000b;animation:recentCdSpin 21s linear infinite;transform:translateZ(-18px) rotate(7deg)}
.recent-cover{position:relative;width:235px;height:235px;overflow:hidden;background:#101014;border:1px solid #2b2b32;border-radius:2px;box-shadow:0 25px 45px #000b,0 0 50px #6a029730;transform:translateZ(28px)}
.recent-cover img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}
.recent-cover-fallback{width:100%;height:100%;display:grid;place-items:center;color:#666;font-size:10px;background:radial-gradient(circle,#1c1c22,#0d0d11)}
.recent-card-info{padding:13px 4px 0;text-align:center;transform:translateZ(34px)}
.recent-card-info strong{display:block;color:#eee;font-size:12px;font-weight:400;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.recent-card-info small{display:block;color:#666;font-size:8px;margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.recent-card-info span{display:block;color:#444;font-size:7px;letter-spacing:.12em;margin-top:7px}
.lastfm-boundary-card{width:235px;height:350px;border:1px solid #2a2a31;border-radius:10px;background:linear-gradient(145deg,rgba(28,28,34,.72),rgba(8,8,11,.82));backdrop-filter:blur(14px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;box-shadow:0 25px 55px #0008;transform:translateZ(22px)}
.lastfm-logo{font-family:Arial,sans-serif;font-weight:800;font-size:34px;letter-spacing:-.07em;color:#e7e7eb}.lastfm-logo span{color:#e05263}
.lastfm-boundary-card small{font-size:7px;letter-spacing:.18em;color:#555}
.recent-carousel-hint{position:absolute;left:0;right:0;bottom:5px;text-align:center;color:#3f3f46;font-size:7px;letter-spacing:.08em;text-transform:uppercase;pointer-events:none}
.recent-carousel-empty{height:350px;display:grid;place-items:center;color:#555;font-size:9px}
@keyframes recentCdSpin{from{transform:translateZ(-18px) rotate(7deg)}to{transform:translateZ(-18px) rotate(367deg)}}
@media(max-width:850px){.recent-card{width:210px}.recent-art-wrap,.recent-cover{width:210px}.recent-art-wrap{height:245px}.recent-cd{width:220px;height:220px}.recent-cover{height:210px}.lastfm-boundary-card{width:210px;height:330px}.recent-carousel{height:400px}}
`;
if (!styles.includes("/* Recent Plays: 15-track 3D carousel")) styles += carouselStyles;
const projectStyles = `

/* Projects: exactly three canonical project cards with interactive logos. */
.projects-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:22px}
.projects-grid .project-card{width:auto;max-width:none;height:100%;display:flex;flex-direction:column;transition:transform .3s cubic-bezier(.2,.8,.2,1),border-color .3s,box-shadow .3s}
.project-logo-wrap{height:210px;display:grid;place-items:center;overflow:hidden;background:radial-gradient(circle at 50% 50%,#17171e,#0b0b0f 72%);position:relative}
.project-logo{width:120px;height:120px;object-fit:contain;display:block;filter:drop-shadow(0 18px 28px #000);transition:transform .45s cubic-bezier(.2,.8,.2,1),filter .45s ease}
.project-card:hover .project-logo{transform:translateY(-5px) scale(1.08) rotate(2deg);filter:drop-shadow(0 22px 34px #000) drop-shadow(0 0 22px #6a029755)}
.project-card-vanta:hover .project-logo{transform:translateY(-5px) scale(1.08) rotate(-2deg)}
.project-card-argo:hover .project-logo{transform:translateY(-5px) scale(1.08) rotate(3deg)}
.project-body{flex:1}
.project-brand span{color:#ddd;margin-left:0}
@media(max-width:900px){.projects-grid{grid-template-columns:1fr}.projects-grid .project-card{width:100%}}
`;
if (!styles.includes("/* Projects: exactly three canonical project cards")) styles += projectStyles;
const preloadStyles = "\n/* Intro transition: keep the fully mounted site underneath while the entry screen fades away. */\n.entry{transition:opacity .7s ease,visibility .7s ease}.entry.exiting{opacity:0;visibility:hidden;pointer-events:none}\n";
if (!styles.includes("/* Intro transition: keep the fully mounted site underneath")) styles += preloadStyles;
fs.writeFileSync(stylesPath, styles);

console.log("prepare-build: canonical Projects = Doxa Dock, Vanta Flow, Argo Node");
