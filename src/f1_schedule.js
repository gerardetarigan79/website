const F1_SCHEDULE_API="https://api.jolpi.ca/f1/alpha/schedules/2026/";
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
  if(Number.isNaN(d.getTime()))return {local:"",wib:""};
  const local=new Intl.DateTimeFormat("en-GB",{weekday:"short",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",timeZone:"Asia/Jakarta",hour12:false}).format(d);
  return {local:`${local} WIB`,wib:""};
}
function sessionCode(session){
  const raw=String(session?.code||session?.type||session?.session_type||"").toUpperCase();
  if(F1_SESSION_LABELS[raw])return raw;
  const title=String(session?.title||session?.name||"").toLowerCase();
  if(title.includes("sprint qualifying")||title.includes("sprint shootout"))return "SQ";
  if(title.includes("sprint race")||title==="sprint")return "SR";
  if(title.includes("qualifying"))return "Q";
  if(title.includes("practice 1")||title.includes("first practice"))return "FP1";
  if(title.includes("practice 2")||title.includes("second practice"))return "FP2";
  if(title.includes("practice 3")||title.includes("third practice"))return "FP3";
  if(title==="race"||title.includes("grand prix"))return "R";
  return null;
}
function collectSessionObjects(value,out=[]){
  if(!value||typeof value!=="object")return out;
  if(Array.isArray(value)){value.forEach(v=>collectSessionObjects(v,out));return out}
  const code=sessionCode(value);
  const timestamp=value.timestamp||value.start_time||value.startTime||value.datetime||value.date_time||value.time;
  if(code&&timestamp)out.push({code,iso:timestamp});
  Object.values(value).forEach(v=>collectSessionObjects(v,out));
  return out;
}
function collectScheduleEntries(value,out=[]){
  if(!value||typeof value!=="object")return out;
  if(Array.isArray(value)){value.forEach(v=>collectScheduleEntries(v,out));return out}
  const hasSessions=Array.isArray(value.sessions);
  const round=value.round||value.round_number||value.roundNumber;
  const circuit=value.circuit;
  if(hasSessions&&(round||circuit))out.push(value);
  Object.values(value).forEach(v=>collectScheduleEntries(v,out));
  return out;
}
function scheduleName(entry){
  const r=entry?.round||{};
  return entry?.raceName||entry?.name||entry?.title||r?.raceName||r?.name||"Grand Prix";
}
function scheduleLocation(entry){
  const c=entry?.circuit||entry?.Circuit||{};
  return c?.name||c?.circuitName||c?.location?.locality||c?.Location?.locality||"";
}
function buildRows(entry){
  const sessions=collectSessionObjects(entry?.sessions||entry);
  const seen=new Set();
  return sessions.filter(s=>{const t=new Date(s.iso).getTime();if(!Number.isFinite(t)||seen.has(s.code))return false;seen.add(s.code);return true})
    .sort((a,b)=>(F1_SESSION_ORDER[a.code]||99)-(F1_SESSION_ORDER[b.code]||99))
    .map(s=>({key:s.code.toLowerCase(),name:F1_SESSION_LABELS[s.code]||s.code,iso:s.iso}));
}
function fallbackRows(){return FALLBACK_DUTCH_SCHEDULE.map(x=>({...x}))}
let f1ScheduleCache=null;
let f1SchedulePromise=null;
async function loadF1Schedule(){
  if(f1ScheduleCache)return f1ScheduleCache;
  if(f1SchedulePromise)return f1SchedulePromise;
  f1SchedulePromise=fetch(F1_SCHEDULE_API,{cache:"no-store",headers:{Accept:"application/json"}}).then(r=>{if(!r.ok)throw new Error("F1 schedule request failed");return r.json()}).then(data=>{
    const entries=collectScheduleEntries(data);
    const now=Date.now();
    const candidates=entries.map(entry=>({entry,rows:buildRows(entry)})).filter(x=>x.rows.some(r=>new Date(r.iso).getTime()>now-12*60*60*1000));
    candidates.sort((a,b)=>{
      const ta=Math.min(...a.rows.map(r=>new Date(r.iso).getTime()).filter(Number.isFinite));
      const tb=Math.min(...b.rows.map(r=>new Date(r.iso).getTime()).filter(Number.isFinite));
      return ta-tb;
    });
    if(!candidates.length)throw new Error("No upcoming F1 schedule found");
    const selected=candidates[0];
    f1ScheduleCache={title:scheduleName(selected.entry),location:scheduleLocation(selected.entry),rows:selected.rows};
    return f1ScheduleCache;
  }).catch(()=>null).finally(()=>{f1SchedulePromise=null});
  return f1SchedulePromise;
}
function renderScheduleData(data){
  const box=document.querySelector(".next-race");
  if(!box||!data)return;
  const oldTitle=box.querySelector("strong")?.textContent?.trim();
  const title=data.title&&data.title!=="Grand Prix"?data.title:(oldTitle||"Next Grand Prix");
  const location=data.location||box.querySelector("small")?.textContent?.trim()||"";
  box.classList.add("f1-schedule-box");
  box.innerHTML=`<div class="f1-schedule-head"><div><span class="kicker">NEXT GRAND PRIX</span><strong>${title}</strong><small>${location}</small></div></div><div class="f1-session-list"></div>`;
  const list=box.querySelector(".f1-session-list");
  data.rows.forEach(row=>{
    const el=document.createElement("div");el.className="f1-session";
    const ts=sessionTimestamp(row.iso);
    el.innerHTML=`<div class="f1-session-info"><b>${row.name}</b><small>${ts.local}</small></div><div class="f1-session-countdown"></div>`;
    list.appendChild(el);
    const count=el.querySelector(".f1-session-countdown"),time=new Date(row.iso).getTime();
    const tick=()=>{const left=time-Date.now();count.textContent=formatCountdown(left);el.classList.toggle("is-done",left<=0)};
    tick();setInterval(tick,1000);
  });
}
async function renderF1Schedule(){
  const data=await loadF1Schedule();
  if(data){renderScheduleData(data);return}
  const existing=document.querySelector(".next-race");
  if(existing)renderScheduleData({title:existing.querySelector("strong")?.textContent||"Dutch Grand Prix",location:existing.querySelector("small")?.textContent||"Zandvoort, Netherlands",rows:fallbackRows()});
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
function bootF1Schedule(){
  const root=document.getElementById("root")||document.body;
  const observer=new MutationObserver(()=>{updateLiveF1Points()});observer.observe(root,{childList:true,subtree:true});
  renderF1Schedule();updateLiveF1Points();
  setInterval(()=>{f1ScheduleCache=null;renderF1Schedule()},15*60*1000);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bootF1Schedule);else bootF1Schedule();
const style=document.createElement("style");
style.textContent=`
.f1-schedule-box{display:block!important;padding:18px!important}.f1-schedule-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px}.f1-schedule-head .kicker{display:block}.f1-schedule-head strong{display:block;font-size:16px;margin-top:3px}.f1-schedule-head small{display:block;margin-top:4px}.f1-session-list{display:grid;gap:7px}.f1-session{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:9px 10px;border:1px solid #24242a;border-radius:8px;background:#111116;transition:border-color .18s ease,background .18s ease}.f1-session:hover{border-color:#3a3a42;background:#14141a}.f1-session-info{min-width:0}.f1-session-info b{display:block;font-size:9px;letter-spacing:.04em;text-transform:uppercase}.f1-session-info small{display:block;margin-top:3px;color:#8f8f98;font-size:8px}.f1-session-countdown{font-size:9px;font-weight:700;letter-spacing:.03em;white-space:nowrap;text-align:right}.f1-session.is-done .f1-session-countdown{color:#66666f;font-weight:600}.f1-session.is-done{opacity:.62}@media(max-width:700px){.f1-schedule-box{padding:14px!important}.f1-session{align-items:flex-start;flex-direction:column;gap:6px}.f1-session-countdown{text-align:left}}
`;
document.head.appendChild(style);
