const F1_SCHEDULE_API="https://api.jolpi.ca/f1/2026.json";
const F1_SESSION_LABELS={FP1:"Practice 1",FP2:"Practice 2",FP3:"Practice 3",SQ:"Sprint Qualifying",SR:"Sprint Race",Q:"Qualifying",R:"Grand Prix"};
const F1_SESSION_ORDER={FP1:1,SQ:2,SR:3,FP2:4,FP3:5,Q:6,R:7};
const FALLBACK_DUTCH_SCHEDULE=[
  {key:"fp1",name:"Practice 1",iso:"2026-08-21T09:30:00Z"},
  {key:"sq",name:"Sprint Qualifying",iso:"2026-08-21T13:30:00Z"},
  {key:"sr",name:"Sprint Race",iso:"2026-08-22T09:00:00Z"},
  {key:"q",name:"Qualifying",iso:"2026-08-22T13:00:00Z"},
  {key:"r",name:"Grand Prix",iso:"2026-08-23T13:00:00Z"}
];
function formatCountdown(ms){
  if(ms<=0)return "LIVE / COMPLETED";
  const total=Math.floor(ms/1000),d=Math.floor(total/86400),h=Math.floor(total%86400/3600),m=Math.floor(total%3600/60),s=total%60;
  return `${d}d ${String(h).padStart(2,"0")}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`;
}
function sessionTimestamp(iso){
  const d=new Date(iso);
  if(Number.isNaN(d.getTime()))return "";
  return `${new Intl.DateTimeFormat("en-GB",{weekday:"short",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",timeZone:"Asia/Jakarta",hour12:false}).format(d)} WIB`;
}
function parseSessionDate(value){
  if(!value)return null;
  if(typeof value==="string")return new Date(value).getTime();
  if(typeof value!=="object")return null;
  const date=value.date||value.Date;
  const time=value.time||value.Time||"00:00:00Z";
  if(date)return new Date(`${date}T${time.replace(/Z$/i,"")}Z`).getTime();
  return null;
}
function buildRaceRows(race){
  const candidates=[];
  const add=(code,value)=>{const t=parseSessionDate(value);if(Number.isFinite(t))candidates.push({key:code.toLowerCase(),name:F1_SESSION_LABELS[code],iso:new Date(t).toISOString()})};
  add("FP1",race.FirstPractice);
  add("SQ",race.SprintQualifying||race.SprintShootout);
  add("SR",race.Sprint);
  add("FP2",race.SecondPractice);
  add("FP3",race.ThirdPractice);
  add("Q",race.Qualifying);
  if(race.date)add("R",{date:race.date,time:race.time||"00:00:00Z"});
  return candidates.sort((a,b)=>(F1_SESSION_ORDER[a.name===F1_SESSION_LABELS.FP1?"FP1":a.name===F1_SESSION_LABELS.SQ?"SQ":a.name===F1_SESSION_LABELS.SR?"SR":a.name===F1_SESSION_LABELS.FP2?"FP2":a.name===F1_SESSION_LABELS.FP3?"FP3":a.name===F1_SESSION_LABELS.Q?"Q":"R"]||99)-(F1_SESSION_ORDER[b.name===F1_SESSION_LABELS.FP1?"FP1":b.name===F1_SESSION_LABELS.SQ?"SQ":b.name===F1_SESSION_LABELS.SR?"SR":b.name===F1_SESSION_LABELS.FP2?"FP2":b.name===F1_SESSION_LABELS.FP3?"FP3":b.name===F1_SESSION_LABELS.Q?"Q":"R"]||99));
}
function raceTitle(race){return race?.raceName||race?.name||"Grand Prix"}
function raceLocation(race){return race?.Circuit?.Location?.locality&&race?.Circuit?.Location?.country?`${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`:race?.Circuit?.circuitName||""}
let f1ScheduleCache=null;
let f1SchedulePromise=null;
async function loadF1Schedule(){
  if(f1ScheduleCache)return f1ScheduleCache;
  if(f1SchedulePromise)return f1SchedulePromise;
  f1SchedulePromise=fetch(F1_SCHEDULE_API,{cache:"no-store",headers:{Accept:"application/json"}}).then(r=>{if(!r.ok)throw new Error("F1 schedule request failed");return r.json()}).then(data=>{
    const races=data?.MRData?.RaceTable?.Races||[];
    const now=Date.now()-12*60*60*1000;
    const candidates=races.map(race=>({race,rows:buildRaceRows(race)})).filter(x=>x.rows.some(r=>new Date(r.iso).getTime()>now));
    candidates.sort((a,b)=>new Date(a.race.date||a.rows[0]?.iso).getTime()-new Date(b.race.date||b.rows[0]?.iso).getTime());
    if(!candidates.length)throw new Error("No upcoming F1 schedule found");
    const selected=candidates[0];
    f1ScheduleCache={title:raceTitle(selected.race),location:raceLocation(selected.race),rows:selected.rows};
    return f1ScheduleCache;
  }).catch(()=>null).finally(()=>{f1SchedulePromise=null});
  return f1SchedulePromise;
}
function renderScheduleData(data){
  const box=document.querySelector(".next-race");
  if(!box||!data?.rows?.length)return;
  const title=data.title||"Next Grand Prix";
  const location=data.location||"";
  box.classList.add("f1-schedule-box");
  box.innerHTML=`<div class="f1-schedule-head"><div><span class="kicker">NEXT GRAND PRIX</span><strong>${title}</strong><small>${location}</small></div></div><div class="f1-session-list"></div>`;
  const list=box.querySelector(".f1-session-list");
  data.rows.forEach(row=>{
    const el=document.createElement("div");el.className="f1-session";
    el.innerHTML=`<div class="f1-session-info"><b>${row.name}</b><small>${sessionTimestamp(row.iso)}</small></div><div class="f1-session-countdown"></div>`;
    list.appendChild(el);
    const count=el.querySelector(".f1-session-countdown"),time=new Date(row.iso).getTime();
    const tick=()=>{const left=time-Date.now();count.textContent=formatCountdown(left);el.classList.toggle("is-done",left<=0)};
    tick();setInterval(tick,1000);
  });
}
function renderFallback(){
  const box=document.querySelector(".next-race");
  if(box)renderScheduleData({title:"Dutch Grand Prix",location:"Zandvoort, Netherlands",rows:FALLBACK_DUTCH_SCHEDULE});
}
async function renderF1Schedule(){
  const data=await loadF1Schedule();
  if(data){renderScheduleData(data);return}
  renderFallback();
}
async function updateLiveF1Points(){
  const box=document.querySelector(".f1-points");
  if(!box||box.dataset.livePointsBound==="1")return;
  box.dataset.livePointsBound="1";
  const rows=[...box.querySelectorAll(".point-row")];
  const update=async()=>{try{
    const [driverRes,constructorRes]=await Promise.all([
      fetch("https://api.jolpi.ca/ergast/f1/current/driverstandings/max_verstappen.json",{cache:"no-store"}),
      fetch("https://api.jolpi.ca/ergast/f1/current/constructorstandings/ferrari.json",{cache:"no-store"})
    ]);
    if(!driverRes.ok||!constructorRes.ok)throw new Error("F1 standings request failed");
    const [driverData,constructorData]=await Promise.all([driverRes.json(),constructorRes.json()]);
    const driver=driverData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0];
    const constructor=constructorData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings?.[0];
    if(driver?.points&&rows[0])rows[0].querySelector("b")?.replaceChildren(document.createTextNode(`${driver.points} pts`));
    if(constructor?.points&&rows[1])rows[1].querySelector("b")?.replaceChildren(document.createTextNode(`${constructor.points} pts`));
    const stamp=box.querySelector(".section-row span");
    if(stamp)stamp.textContent=`updated ${new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",timeZone:"Asia/Jakarta"})} WIB`;
  }catch{}};
  await update();setInterval(update,5*60*1000);
}
async function updateF1SeasonCompletion(){
  const bar=document.querySelector(".f1-points .bar");
  if(!bar||bar.dataset.seasonCompletionBound==="1")return;
  bar.dataset.seasonCompletionBound="1";
  const update=async()=>{
    try{
      const response=await fetch(F1_SCHEDULE_API,{cache:"no-store",headers:{Accept:"application/json"}});
      if(!response.ok)throw new Error("F1 calendar request failed");
      const data=await response.json();
      const races=data?.MRData?.RaceTable?.Races||[];
      if(!races.length)throw new Error("No F1 races found");
      const now=Date.now();
      const total=races.length;
      const completed=races.filter(r=>{
        const t=parseSessionDate({date:r.date,time:r.time||"00:00:00Z"});
        return Number.isFinite(t)&&t<=now;
      }).length;
      const percentage=Math.max(0,Math.min(100,(completed/total)*100));
      const fill=bar.querySelector(":scope > span:first-child");
      if(fill)fill.style.width=`${percentage.toFixed(1)}%`;
      bar.dataset.seasonCompletion=`${percentage.toFixed(1)}`;
    }catch{}
  };
  await update();
  setInterval(update,15*60*1000);
}
let scheduleRenderTimer=null;
function bootF1Schedule(){
  const root=document.getElementById("root")||document.body;
  const observer=new MutationObserver(()=>{
    updateLiveF1Points();
    updateF1SeasonCompletion();
    if(document.querySelector(".next-race")&&!document.querySelector(".next-race .f1-session-list")){clearTimeout(scheduleRenderTimer);scheduleRenderTimer=setTimeout(renderF1Schedule,50)}
  });
  observer.observe(root,{childList:true,subtree:true});
  renderF1Schedule();
  updateLiveF1Points();
  updateF1SeasonCompletion();
  setInterval(()=>{f1ScheduleCache=null;renderF1Schedule()},15*60*1000);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bootF1Schedule);else bootF1Schedule();
const style=document.createElement("style");
style.textContent=`
.f1-schedule-box{display:block!important;padding:18px!important}.f1-schedule-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px}.f1-schedule-head .kicker{display:block}.f1-schedule-head strong{display:block;font-size:16px;margin-top:3px}.f1-schedule-head small{display:block;margin-top:4px}.f1-session-list{display:grid;gap:7px}.f1-session{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:9px 10px;border:1px solid #24242a;border-radius:8px;background:#111116;transition:border-color .18s ease,background .18s ease}.f1-session:hover{border-color:#3a3a42;background:#14141a}.f1-session-info{min-width:0}.f1-session-info b{display:block;font-size:9px;letter-spacing:.04em;text-transform:uppercase}.f1-session-info small{display:block;margin-top:3px;color:#8f8f98;font-size:8px}.f1-session-countdown{font-size:9px;font-weight:700;letter-spacing:.03em;white-space:nowrap;text-align:right}.f1-session.is-done .f1-session-countdown{color:#66666f;font-weight:600}.f1-session.is-done{opacity:.62}@media(max-width:700px){.f1-schedule-box{padding:14px!important}.f1-session{align-items:flex-start;flex-direction:column;gap:6px}.f1-session-countdown{text-align:left}}
`;
document.head.appendChild(style);
