import React, {useEffect, useMemo, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import {
  Home as HomeIcon, Music2, FolderKanban, Code2, Monitor, Link2, Mail, Gamepad2,
  Trophy, ExternalLink, Github, Globe2, Cpu, HardDrive, MemoryStick,
  Mouse, Database, Palette, Video, FileImage, GitBranch, Braces, Terminal,
  Zap, Clock3, Cloud, Wind, Droplets, Activity, ChevronRight, Copy, Check,
  Play, Pause, Disc3, Flame, Users, Timer, CalendarDays, Gauge, Sparkles,
  RefreshCw
} from "lucide-react";
import TargetCursor from "./TargetCursor";
import OptionWheel from "./OptionWheel";
import "./styles.css";

const DISCORD_ID = "715076381293150288";
const LASTFM_USER = "drva7";
const BIRTHDATE = new Date("2008-09-07T00:00:00+08:00");
const PAGES = ["home","music","projects","skills","setup","games","f1","biolinks","contact"];

const NAV = [
  ["home","Home",HomeIcon],["music","Music",Music2],["projects","Projects",FolderKanban],
  ["skills","Skills",Code2],["setup","Setup",Monitor],["games","Games",Gamepad2],
  ["f1","F1",Trophy],["biolinks","Biolinks",Link2],["contact","Contact",Mail]
];

const BIO = [
  ["guns.lol","https://guns.lol/drav","G"],
  ["feds.lol","https://feds.lol/drav","F"],
  ["haunt.gg","https://haunt.gg/drav","H"]
];

function useClock(){
  const [now,setNow]=useState(new Date());
  useEffect(()=>{const id=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(id)},[]);
  return now;
}
function useAgeMs(){
  const [ms,setMs]=useState(()=>Math.max(0,Date.now()-BIRTHDATE.getTime()));
  useEffect(()=>{const id=setInterval(()=>setMs(Math.max(0,Date.now()-BIRTHDATE.getTime())),1);return()=>clearInterval(id)},[]);
  return ms;
}
function fmtNum(n){return new Intl.NumberFormat("en-US").format(n||0)}
function ageParts(ms){
  const d=new Date(BIRTHDATE.getTime()+ms);
  let years=d.getUTCFullYear()-2008;
  const days=Math.floor((ms-(Date.UTC(2008+years,8,7)-Date.UTC(2008,8,7)))/86400000);
  return {years,days};
}
function FlipClock(){
  const now=useClock();
  const time=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Jakarta",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(now);
  const [h,m,s]=time.split(":");
  const date=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Jakarta",weekday:"short",month:"long",day:"numeric"}).format(now);
  return <div className="widget flip-widget cursor-target">
    <div className="flip-time">{[h,m,s].flatMap((x,i)=>i?[<span className="colon" key={`c${i}`}>:</span>,...x.split("").map((d,j)=><span className="flip" key={`${i}${j}`}>{d}</span>)]:x.split("").map((d,j)=><span className="flip" key={`${i}${j}`}>{d}</span>))}</div>
    <div className="clock-meta"><span><Clock3 size={11}/> Timezone</span><b>{date}</b><small>UTC+7 · WITA/WIB compatible</small></div>
  </div>
}
function AgeWidget(){
  const ms=useAgeMs(), {years,days}=ageParts(ms);
  return <div className="widget age-widget cursor-target">
    <div><span className="eyebrow">AGE</span><strong>{years}</strong><small>years old · day {fmtNum(days)}</small></div>
    <div className="age-ms"><span>exact age</span><b title={`${fmtNum(ms)} milliseconds since September 7, 2008`}>{fmtNum(ms)}</b><small>milliseconds</small></div>
  </div>
}
function WeatherWidget(){
  const [w,setW]=useState(null),[loading,setLoading]=useState(true);
  useEffect(()=>{fetch("https://api.open-meteo.com/v1/forecast?latitude=-7.2575&longitude=112.7521&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia%2FJakarta").then(r=>r.json()).then(x=>setW(x.current)).catch(()=>setW(null)).finally(()=>setLoading(false));},[]);
  const code=w?.weather_code; const cloudy=code==null?"":code>=45?"Cloudy":code>=1?"Partly cloudy":"Clear";
  return <div className="widget weather-widget cursor-target"><Cloud size={30}/><div><strong>{loading?"Loading weather…":`It's currently ${Math.round(w?.temperature_2m||0)}°C, ${cloudy}`}</strong><div className="weather-meta"><span><Wind size={11}/>{Math.round(w?.wind_speed_10m||0)} km/h</span><span><Droplets size={11}/>{w?.relative_humidity_2m||0}%</span></div></div><span className="widget-label">Weather</span></div>
}
function DiscordCard(){
  const [p,setP]=useState(null),[loading,setLoading]=useState(true);
  useEffect(()=>{const load=()=>fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`).then(r=>r.json()).then(x=>setP(x.data)).catch(()=>{}).finally(()=>setLoading(false));load();const id=setInterval(load,10000);return()=>clearInterval(id)},[]);
  const user=p?.discord_user; const avatar=user?.avatar?`https://cdn.discordapp.com/avatars/${DISCORD_ID}/${user.avatar}.${user.avatar.startsWith("a_")?"gif":"png"}?size=128`:`https://api.lanyard.rest/${DISCORD_ID}.png`;
  const decoration=user?.avatar_decoration_data?.asset; const decorationUrl=decoration?`https://cdn.discordapp.com/avatar-decoration-presets/${decoration}.png?size=128`:null; const flags=user?.public_flags||0;
  const badgeDefs=[[1,"Discord Staff","STAFF"],[2,"Partner","PARTNER"],[4,"HypeSquad Events","HYPE"],[8,"Bug Hunter","BUG"],[128,"HypeSquad Brilliance","BRI"],[256,"HypeSquad Balance","BAL"],[512,"Early Supporter","EARLY"],[16384,"Bug Hunter Level 2","BUG2"],[131072,"Verified Bot Developer","DEV"],[262144,"Certified Moderator","MOD"],[4194304,"Active Developer","ACTIVE"]];
  const badges=badgeDefs.filter(([bit])=>(flags&bit)===bit); const premium=user?.premium_type===2;
  return <div className="discord-card cursor-target"><div className="avatar-wrap"><img className="avatar" src={avatar}/><span className={`presence ${p?.discord_status||"offline"}`}/>{decorationUrl&&<img className="avatar-decoration" src={decorationUrl}/>}</div><div className="discord-info"><div className="name-row"><strong>{user?.global_name||user?.username||"Draven"}</strong><span className="discord-tag">@{user?.username||"drva"}</span></div><span className="presence-text">{loading?"loading presence…":p?.discord_status||"offline"}</span>{(badges.length>0||premium)&&<div className="badges">{badges.map(([_,name,label])=><span title={name} key={name}>{label}</span>)}{premium&&<span title="Discord Nitro">NITRO</span>}</div>}{p?.activities?.filter(a=>a.name!=="Spotify").slice(0,1).map(a=><div className="activity" key={a.id}><span>Playing</span> {a.name}{a.details?` · ${a.details}`:""}</div>)}</div><a className="small-action" href={`https://discord.com/users/${DISCORD_ID}`} target="_blank" rel="noreferrer">discord <ExternalLink size={10}/></a></div>
}
function Home(){return <Page id="home" kicker="hey there" title="Draven"><p className="lead">i'm a <b>VFX and GFX designer, editor & Information Systems student</b> building things across creative software and modern web technology. check out my <a href="#projects">projects</a> or find me on <a href="#contact">discord</a>.</p><DiscordCard/><div className="home-widgets"><AgeWidget/><FlipClock/><WeatherWidget/></div></Page>}
function Page({id,kicker,title,children}){return <section className="page" id={id}><div className="page-inner"><div className="kicker">{kicker}</div><h1>{title}</h1>{children}</div></section>}
function Pill({children,icon:I}){return <span className="pill cursor-target">{I&&<I size={11}/>} {children}</span>}
async function lastfm(type,extra=""){const r=await fetch(`/api/lastfm?type=${type}${extra}`);if(!r.ok)throw Error("Last.fm unavailable");return r.json()}
function Music(){const [data,setData]=useState({recent:[],artists:[],albums:[],info:null}),[loading,setLoading]=useState(true),[playing,setPlaying]=useState(false);const load=async()=>{try{const [recent,artists,albums,info]=await Promise.all([lastfm("recent"),lastfm("artists"),lastfm("albums"),lastfm("info")]);setData({recent:recent.recenttracks?.track||[],artists:artists.topartists?.artist||[],albums:albums.topalbums?.album||[],info:info.user||null})}catch(e){}finally{setLoading(false)}};useEffect(()=>{load();const id=setInterval(load,15000);return()=>clearInterval(id)},[]);const current=data.recent?.find(x=>x["@attr"]?.nowplaying==="true")||data.recent?.[0];return <Page id="music" kicker="what i've been listening to" title="music"><p className="lead">live listening data from <b>Last.fm</b>, updated automatically.</p><div className="music-stats">{<Stat label="Scrobbles" value={data.info?fmtNum(data.info.playcount):""}/>}<Stat label="Artists" value={data.info?fmtNum(data.info.artist_count):""}/><Stat label="Last.fm user" value={LASTFM_USER}/></div><div className="music-layout"><MusicList title="TOP ARTISTS · 30D" items={data.artists.slice(0,5).map(x=>({name:x.name,meta:x.playcount}))}/><div className="now-playing cursor-target"><div className="music-heading">✦ RECENT PLAYS ✦</div>{loading?<Skeleton/>:<><div className="record-stage"><div className="record-disc" aria-label="Current track CD"/></div><div className="np-bottom"><div><strong>{current?.name||"nothing playing"}</strong><small>{current?.artist?.["#text"]||"Last.fm"} · {current?.["@attr"]?.nowplaying==="true"?"now":"recent"}</small></div><button onClick={()=>setPlaying(x=>!x)}>{playing?<Pause size={14}/>:<Play size={14}/>}</button></div></>}</div><MusicList title="TOP ALBUMS · 30D" items={data.albums.slice(0,6).map(x=>({name:x.name,meta:x.artist?.name}))}/></div></Page>}
function Stat({label,value}){return <div className="stat cursor-target"><span>{label}</span><b>{value}</b></div>}
function MusicList({title,items}){return <div className="music-list cursor-target"><h3>{title}</h3>{items.map((x,i)=><div className="music-item cursor-target" key={i}><span className="rank">{i+1}</span><div><strong>{x.name}</strong><small>{x.meta}</small></div></div>)}</div>}
function Skeleton(){return <div className="skeleton-card cursor-target"><div/><div/><div/></div>}

const skillGroups={"creative":[["After Effects",Video],["Photoshop",FileImage],["Adobe Media Encoder",Video],["Element 3D",Zap],["Figma",Palette]],"development":[["Visual Studio Code",Code2],["Git",GitBranch],["GitHub",Github],["Vercel",Globe2],["Java",Braces],["Lua",Terminal]],"databases & data":[["PostgreSQL",Database],["MySQL",Database],["SQLite",Database],["R",Code2],["RStudio",Code2],["GitHub Actions",Zap]]};
function Projects(){return <Page id="projects" kicker="my work" title="projects"><p className="lead">commissions, collaborations, and personal builds. select work that might be the most.</p><div className="project-card cursor-target"><div className="doxa-preview"><div className="doxa-title">Doxa Dock</div><div className="doxa-sub">private user application</div></div><div className="project-body"><div className="project-brand">D <span>doxa dock</span></div><h2>private user application</h2><p>a private application built with a focused interface and custom functionality.</p><a href="#contact">view project <ExternalLink size={10}/></a></div></div></Page>}
function Skills(){return <Page id="skills" kicker="my tech stack" title="skills"><p className="lead">a collection of software, frameworks, and tools i use to build amazing things.</p>{Object.entries(skillGroups).map(([g,x])=><div className="skill-group cursor-target" key={g}><h3>{g}</h3><div className="pill-wrap">{x.map(([n,I])=><Pill key={n} icon={I}>{n}</Pill>)}</div></div>)}</Page>}
function Setup(){const hardware=[["CPU","Intel(R) Core(TM) i7-14650HX",Cpu],["GPU","NVIDIA GeForce RTX 5050",Monitor],["RAM","32 GB (2 x 16 GB) DDR5 5600MT/S",MemoryStick],["Storage","512 GB NVMe SSD",HardDrive],["Motherboard","ASUSTeK FX608JHR",Cpu],["Mouse","Glorious Model O Wireless",Mouse]];return <Page id="setup" kicker="what i use" title="setup"><p className="lead">the hardware, editor, and apps that show up in my workflow most days.</p><h3 className="group-title">hardware</h3><div className="setup-grid">{hardware.map(([a,b,I])=><div className="setup-card cursor-target" key={a}><I size={17}/><div><strong>{b}</strong><small>{a}</small></div></div>)}</div></Page>}
function Games(){const [steam,setSteam]=useState(null);const [roblox,setRoblox]=useState("");useEffect(()=>{fetch("/api/steam").then(r=>r.json()).then(setSteam).catch(()=>setSteam({error:true}));fetch("/api/roblox").then(r=>r.json()).then(x=>setRoblox(x.imageUrl||"")).catch(()=>{})},[]);return <Page id="games" kicker="games & profiles" title="games"><p className="lead">a few places where i spend time when i'm not building things.</p><div className="game-grid"><GameCard title="Roblox" subtitle="@331953010" href="https://www.roblox.com/users/331953010/profile">{roblox?<img className="roblox" src={roblox} alt="Roblox avatar"/>:<div className="game-loader"><span/></div>}</GameCard><GameCard title="Minecraft" subtitle="iDraven" href="https://namemc.com/profile/iDraven.6"><img className="minecraft" src="https://mc-heads.net/body/iDraven/320" alt="Minecraft character"/></GameCard></div><div className="steam-card cursor-target"><div className="steam-head"><div><span className="kicker">STEAM</span><h2>chungusanimals</h2></div><a href="https://steamcommunity.com/id/chungusanimals/" target="_blank" rel="noreferrer">open profile <ExternalLink size={10}/></a></div>{steam&&!steam.error?<><div className="steam-stats">{["Games owned","Total playtime","Recent","Friends","Badges","Profile age"].map((label,i)=><Stat key={label} label={label} value={[steam.games,steam.playtime,steam.recent,steam.friends,steam.badges,steam.age][i]||""}/>)}</div></>:<div className="steam-unavailable"><Skeleton/><small>Steam profile data is unavailable right now.</small></div>}</div></Page>}
function GameCard({title,subtitle,href,children}){return <a className="game-card" href={href} target="_blank" rel="noreferrer"><div className="game-visual">{children}</div><div className="game-info"><strong>{title}</strong><small>{subtitle}</small><ExternalLink size={11}/></div></a>}
function F1(){const [stand,setStand]=useState(null),[next,setNext]=useState(null),[updated,setUpdated]=useState(null);const load=()=>fetch("/api/f1").then(r=>r.json()).then(x=>{setStand({driver:x.driver,constructor:x.constructor});setNext(x.next);setUpdated(x.fetchedAt)}).catch(()=>{});useEffect(()=>{load();const id=setInterval(load,60000);return()=>clearInterval(id)},[]);return <Page id="f1" kicker="my formula 1 widget" title="f1"><p className="lead">track my Formula 1 interests.</p><div className="f1-hero cursor-target"><div><span className="f1-mark">F1</span><h2>F1 Dashboard</h2><p>live points, next Grand Prix, and my F1 interests.</p></div><img className="f1-logo" src="https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg" alt="Formula 1"/></div><div className="f1-interest-grid"><Interest icon={<img className="interest-image" src="https://di-uploads-pod31.dealerinspire.com/ferrarioffortlauderdale/uploads/2026/03/scuderia-logo-v02.png" alt="Scuderia Ferrari"/>} title="Constructor" value="Scuderia Ferrari HP"/><Interest icon={<img className="interest-image" src="https://images.seeklogo.com/logo-png/45/2/max-verstappen-logo-png_seeklogo-454438.png" alt="Max Verstappen"/>} title="Driver" value="Max Verstappen · #3"/><Interest icon="⌁" title="Next Grand Prix" value={next?`${next.raceName} · ${next.Circuit?.Location?.locality}, ${next.Circuit?.Location?.country}`:"loading…"}/></div><div className="f1-points cursor-target"><div className="section-row"><h3>LIVE POINT TRACK</h3><span>{updated?`updated ${new Date(updated).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}`:"updating…"}</span></div><div className="bar"><span style={{width:`${Math.min(100,(Number(stand?.driver?.points)||0)/500*100)}%`}}/></div><div className="point-row"><span>Max Verstappen</span><b>{stand?.driver?.points||""} pts</b></div><div className="point-row"><span>Ferrari</span><b>{stand?.constructor?.points||""} pts</b></div></div><div className="next-race cursor-target">{next?<><div><span className="kicker">NEXT GRAND PRIX</span><strong>{next.raceName}</strong><small>{next.Circuit?.circuitName} · {next.date}</small></div><div className="countdown"><NextCountdown date={next.date+"T"+(next.time||"12:00:00Z")}/></div></>:<Skeleton/>}</div></Page>}
function NextCountdown({date}){const [n,setN]=useState(Date.now());useEffect(()=>{const id=setInterval(()=>setN(Date.now()),1000);return()=>clearInterval(id)},[]);const d=Math.max(0,new Date(date)-n),h=Math.floor(d/3600000),m=Math.floor(d%3600000/60000),s=Math.floor(d%60000/1000);return <div className="count-num">{Math.floor(h/24)}d {String(h%24).padStart(2,"0")}:{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}</div>}
function Interest({icon,title,value}){return <div className="interest cursor-target"><span>{icon}</span><div><b>{title}</b><small>{value}</small></div></div>}
function Biolinks(){return <Page id="biolinks" kicker="my links" title="biolinks"><p className="lead">my <b>biolinks</b></p><div className="bio-list">{BIO.map(([n,u,i])=><a className="bio-card" href={u} target="_blank" rel="noreferrer" key={n}><span>{i}</span><div><strong>{n}</strong><small>@drav</small></div><ExternalLink size={12}/></a>)}</div></Page>}
function Contact(){const [copied,setCopied]=useState(false);const copy=async()=>{await navigator.clipboard?.writeText("@drva");setCopied(true);setTimeout(()=>setCopied(false),1500)};return <Page id="contact" kicker="get in touch" title="contact"><p className="lead">questions, or just a hello. <b>discord</b> is the fastest way to reach me.</p><div className="contact-card cursor-target"><div className="contact-person"><div className="simple-avatar">D</div><div><strong>Draven</strong><small>feel free to reach me</small></div></div><div className="contact-buttons"><button onClick={copy}> {copied?<Check size={11}/>:<Copy size={11}/>} @drva</button><a href="https://discord.com/users/715076381293150288" target="_blank" rel="noreferrer">open <ExternalLink size={11}/></a></div></div></Page>}
function Entry({onEnter}){const [ready,setReady]=useState(false);useEffect(()=>{const t=setTimeout(()=>setReady(true),600);return()=>clearTimeout(t)},[]);return <div className="entry" onClick={onEnter} onKeyDown={e=>{if(e.key==="Enter"||e.key===" ")onEnter()}} tabIndex="0"><div className="entry-stars">✦</div><div className="entry-title">Draven's Website</div><div className="entry-sub">press anything to enter</div><div className="entry-line"/></div>}
function Views(){const [views,setViews]=useState(null);useEffect(()=>{fetch("/api/views",{method:"POST"}).then(r=>r.json()).then(x=>setViews(x.views)).catch(()=>{const k="draven-local-views";const v=Number(localStorage.getItem(k)||"0")+1;localStorage.setItem(k,v);setViews(v)})},[]);return <div className="views">◉ {views==null?"":fmtNum(views)}</div>}
function App(){const [entered,setEntered]=useState(sessionStorage.getItem("draven-entered")==="1");const [active,setActive]=useState("home");useEffect(()=>{const sync=()=>{const hash=window.location.hash.replace("#","");if(PAGES.includes(hash))setActive(hash)};sync();const io=new IntersectionObserver(es=>{const visible=es.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible)setActive(visible.target.id)},{rootMargin:"-42% 0px -42% 0px",threshold:[0,.2,.5,1]});PAGES.forEach(id=>{const el=document.getElementById(id);if(el)io.observe(el)});window.addEventListener("hashchange",sync);return()=>{io.disconnect();window.removeEventListener("hashchange",sync)}},[entered]);const enter=()=>{sessionStorage.setItem("draven-entered","1");setEntered(true)};const navigate=id=>{setActive(id);window.history.replaceState(null,"",`#${id}`);requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"}))};const cursor=<TargetCursor targetSelector="a, button, [role='button'], .cursor-target" spinDuration={2} hideDefaultCursor={true} parallaxOn={true}/>;if(!entered)return <>{cursor}<Entry onEnter={enter}/></>;return <>{cursor}<aside className="option-wheel-sidebar"><OptionWheel items={NAV.map(([_,label])=>label)} defaultSelected={PAGES.indexOf(active)} textColor="#a6a6a6" activeColor="#ffffff" side="left" fontSize={3} spacing={1.4} curve={1} tilt={6} blur={2} fade={0.25} smoothing={200} inset={18} loop={false} draggable soundUrl="/audio/soundclick.mp3" soundVolume={0.5} onChange={(index)=>navigate(PAGES[index])}/></aside><main className="site">{PAGES.map(id=>({home:<Home/>,music:<Music/>,projects:<Projects/>,skills:<Skills/>,setup:<Setup/>,games:<Games/>,f1:<F1/>,biolinks:<Biolinks/>,contact:<Contact/>}[id]))}</main><Views/></>}
createRoot(document.getElementById("root")).render(<App/>);
