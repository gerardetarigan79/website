import fs from "node:fs";

const path = "src/main.jsx";
let source = fs.readFileSync(path, "utf8");

const start = source.indexOf("function Entry({onEnter})");
const endMarker = "createRoot(document.getElementById(\"root\")).render(<App/>);";
const end = source.indexOf(endMarker, start);

if (start === -1 || end === -1) {
  throw new Error("prepare-build: could not find Entry/App block in src/main.jsx");
}

const replacement = `function Entry({onEnter, exiting}){const [ready,setReady]=useState(false);useEffect(()=>{const t=setTimeout(()=>setReady(true),600);return()=>clearTimeout(t)},[]);return <div className={\`entry${ready?" ready":""}${exiting?" exiting":""}\`} onClick={onEnter} onKeyDown={e=>{if(e.key==="Enter"||e.key===" ")onEnter()}} tabIndex="0"><div className="entry-stars">✦</div><div className="entry-title"><ASCIIText text="Draven" enableWaves={true} asciiFontSize={8}/></div><div className="entry-sub">press anything to enter</div><div className="entry-line"/></div>}
function Views(){const [views,setViews]=useState(null);useEffect(()=>{fetch("/api/views",{method:"POST"}).then(r=>r.json()).then(x=>setViews(x.views)).catch(()=>{const k="draven-local-views";const v=Number(localStorage.getItem(k)||"0")+1;localStorage.setItem(k,v);setViews(v)})},[]);return <div className="views">◉ {views==null?"":fmtNum(views)}</div>}
function App(){const [entryVisible,setEntryVisible]=useState(()=>sessionStorage.getItem("draven-entered")!=="1");const [entryExiting,setEntryExiting]=useState(false);const [active,setActive]=useState("home");useEffect(()=>{const sync=()=>{const hash=window.location.hash.replace("#","");if(PAGES.includes(hash))setActive(hash)};sync();const io=new IntersectionObserver(es=>{const visible=es.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible)setActive(visible.target.id)},{rootMargin:"-42% 0px -42% 0px",threshold:[0,.2,.5,1]});PAGES.forEach(id=>{const el=document.getElementById(id);if(el)io.observe(el)});window.addEventListener("hashchange",sync);return()=>{io.disconnect();window.removeEventListener("hashchange",sync)}},[]);const enter=()=>{if(entryExiting)return;sessionStorage.setItem("draven-entered","1");setEntryExiting(true);setTimeout(()=>setEntryVisible(false),700)};const navigate=id=>{setActive(id);window.history.replaceState(null,"","#"+id);requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"}))};const cursor=<TargetCursor targetSelector="a, button, [role='button'], .cursor-target" spinDuration={2} hideDefaultCursor={true} parallaxOn={true}/>;const background=<><LightRays raysOrigin="top-center" raysColor="#00ffff" raysSpeed={1.5} lightSpread={0.8} rayLength={1.2} followMouse={true} mouseInfluence={0.1} noiseAmount={0.1} distortion={0.05} className="custom-rays" pulsating /></>;return <>{background}{cursor}{entryVisible&&<Entry onEnter={enter} exiting={entryExiting}/>}<aside className="option-wheel-sidebar"><OptionWheel items={NAV.map(([_,label])=>label)} defaultSelected={PAGES.indexOf(active)} textColor="#a6a6a6" activeColor="#ffffff" side="left" fontSize={3} spacing={1.4} curve={1} tilt={6} blur={2} fade={0.25} smoothing={200} inset={18} loop={false} draggable soundUrl="/audio/soundclick.mp3" soundVolume={0.5} onChange={(index)=>navigate(PAGES[index])}/></aside><main className="site">{PAGES.map(id=>({home:<Home/>,music:<Music/>,projects:<Projects/>,skills:<Skills/>,setup:<Setup/>,games:<Games/>,f1:<F1/>,biolinks:<Biolinks/>,contact:<Contact/>}[id]))}</main><Views/></>}
createRoot(document.getElementById("root")).render(<App/>);`;

source = source.slice(0, start) + replacement + "\n";
fs.writeFileSync(path, source);

const stylesPath = "src/styles.css";
let styles = fs.readFileSync(stylesPath, "utf8");
const preloadStyles = "\n/* Intro transition: keep the fully mounted site underneath while the entry screen fades away. */\n.entry{transition:opacity .7s ease,visibility .7s ease}.entry.exiting{opacity:0;visibility:hidden;pointer-events:none}\n";
if (!styles.includes("/* Intro transition: keep the fully mounted site underneath")) {
  styles += preloadStyles;
  fs.writeFileSync(stylesPath, styles);
}

console.log("prepare-build: main site mounts immediately behind the intro and is revealed after the intro fade");
