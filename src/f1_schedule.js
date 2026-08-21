const SPRINT_ROUNDS=new Set([2,4,6,9,12,18]);
const DUTCH_SCHEDULE=[
  {key:"fp1",name:"Practice 1",iso:"2026-08-21T12:30:00+02:00",local:"Fri 21 Aug · 12:30 CEST",user:"17:30 WIB"},
  {key:"sprint-quali",name:"Sprint Qualifying",iso:"2026-08-21T16:30:00+02:00",local:"Fri 21 Aug · 16:30 CEST",user:"21:30 WIB"},
  {key:"sprint",name:"Sprint Race",iso:"2026-08-22T12:00:00+02:00",local:"Sat 22 Aug · 12:00 CEST",user:"17:00 WIB"},
  {key:"quali",name:"Qualifying",iso:"2026-08-22T16:00:00+02:00",local:"Sat 22 Aug · 16:00 CEST",user:"21:00 WIB"},
  {key:"race",name:"Grand Prix",iso:"2026-08-23T15:00:00+02:00",local:"Sun 23 Aug · 15:00 CEST",user:"20:00 WIB"}
];
const RACE_TIMES={
  "Italian Grand Prix":["2026-09-06T15:00:00+02:00","Sun 06 Sep · 15:00 CEST","20:00 WIB"],
  "Azerbaijan Grand Prix":["2026-09-26T16:00:00+04:00","Sat 26 Sep · 16:00 AZT","19:00 WIB"],
  "Singapore Grand Prix":["2026-10-11T20:00:00+08:00","Sun 11 Oct · 20:00 SGT","19:00 WIB"]
};
function f1ScheduleRows(){
  const race=document.querySelector(".next-race strong")?.textContent?.trim();
  if(!race)return null;
  if(race.includes("Dutch Grand Prix"))return DUTCH_SCHEDULE;
  const [iso,local,user]=RACE_TIMES[race]||[];
  if(iso)return [{key:"race",name:"Grand Prix",iso,local,user}];
  return null;
}
function formatCountdown(ms){
  if(ms<=0)return "LIVE / COMPLETED";
  const total=Math.floor(ms/1000),d=Math.floor(total/86400),h=Math.floor(total%86400/3600),m=Math.floor(total%3600/60),s=total%60;
  return `${d}d ${String(h).padStart(2,"0")}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`;
}
function renderF1Schedule(){
  const box=document.querySelector(".next-race"),rows=f1ScheduleRows();
  if(!box||!rows||box.dataset.f1ScheduleRendered==="1")return;
  box.dataset.f1ScheduleRendered="1";
  const head=box.querySelector(":scope > div:first-child"),title=head?.querySelector("strong")?.textContent||"Next Grand Prix";
  const location=head?.querySelector("small")?.textContent||"";
  box.classList.add("f1-schedule-box");
  box.innerHTML=`<div class="f1-schedule-head"><div><span class="kicker">NEXT GRAND PRIX</span><strong>${title}</strong><small>${location}</small></div></div><div class="f1-session-list"></div>`;
  const list=box.querySelector(".f1-session-list");
  rows.forEach(row=>{
    const el=document.createElement("div");
    el.className="f1-session";
    el.innerHTML=`<div class="f1-session-info"><b>${row.name}</b><small>${row.local} · ${row.user}</small></div><div class="f1-session-countdown"></div>`;
    list.appendChild(el);
    const count=el.querySelector(".f1-session-countdown");
    const tick=()=>{count.textContent=formatCountdown(new Date(row.iso).getTime()-Date.now());el.classList.toggle("is-done",new Date(row.iso).getTime()<=Date.now())};
    tick();setInterval(tick,1000);
  });
}
async function updateLiveF1Points(){
  const box=document.querySelector(".f1-points");
  if(!box||box.dataset.livePointsBound==="1")return;
  box.dataset.livePointsBound="1";
  const rows=[...box.querySelectorAll(".point-row")];
  const update=async()=>{
    try{
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
    }catch{}
  };
  await update();
  setInterval(update,5*60*1000);
}
function bootF1Schedule(){
  const root=document.getElementById("root")||document.body;
  const observer=new MutationObserver(()=>{renderF1Schedule();updateLiveF1Points()});
  observer.observe(root,{childList:true,subtree:true});
  renderF1Schedule();
  updateLiveF1Points();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bootF1Schedule);else bootF1Schedule();
const style=document.createElement("style");
style.textContent=`
.f1-schedule-box{display:block!important;padding:18px!important}.f1-schedule-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px}.f1-schedule-head .kicker{display:block}.f1-schedule-head strong{display:block;font-size:16px;margin-top:3px}.f1-schedule-head small{display:block;margin-top:4px}.f1-session-list{display:grid;gap:7px}.f1-session{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:9px 10px;border:1px solid #24242a;border-radius:8px;background:#111116;transition:border-color .18s ease,background .18s ease}.f1-session:hover{border-color:#3a3a42;background:#14141a}.f1-session-info{min-width:0}.f1-session-info b{display:block;font-size:9px;letter-spacing:.04em;text-transform:uppercase}.f1-session-info small{display:block;margin-top:3px;color:#8f8f98;font-size:8px}.f1-session-countdown{font-size:9px;font-weight:700;letter-spacing:.03em;white-space:nowrap;text-align:right}.f1-session.is-done .f1-session-countdown{color:#66666f;font-weight:600}.f1-session.is-done{opacity:.62}@media(max-width:700px){.f1-schedule-box{padding:14px!important}.f1-session{align-items:flex-start;flex-direction:column;gap:6px}.f1-session-countdown{text-align:left}}
`;
document.head.appendChild(style);
