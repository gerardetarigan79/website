const RECENT_PLAYS_ID = "recent-plays-carousel";
const RECENT_MAX_TRACKS = 15;
const RECENT_STEP = 175;

function recentBestImage(track){
  const images=track?.image;
  if(Array.isArray(images)) for(let i=images.length-1;i>=0;i--){
    const value=images[i]?.["#text"];
    if(typeof value==="string"&&value.trim()&&!value.includes("undefined")) return value.trim();
  }
  return "";
}
function recentEsc(value){return String(value||"").replace(/[&<>\"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]))}

function addRecentPlaysStyles(){
  if(document.getElementById("recent-plays-carousel-styles")) return;
  const style=document.createElement("style");
  style.id="recent-plays-carousel-styles";
  style.textContent=`
    #${RECENT_PLAYS_ID}{position:relative;margin-top:28px;width:100%;overflow:hidden;isolation:isolate;padding:10px 0 4px}
    #${RECENT_PLAYS_ID} .rpc-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
    #${RECENT_PLAYS_ID} .rpc-heading h3{margin:0;font-size:11px;letter-spacing:.14em;font-weight:700;color:#aaa}
    #${RECENT_PLAYS_ID} .rpc-viewport{position:relative;height:390px;perspective:1100px;transform-style:preserve-3d;overflow:visible;touch-action:pan-y}
    #${RECENT_PLAYS_ID} .rpc-viewport::before,#${RECENT_PLAYS_ID} .rpc-viewport::after{content:"";position:absolute;top:0;bottom:0;width:18%;z-index:80;pointer-events:none}
    #${RECENT_PLAYS_ID} .rpc-viewport::before{left:0;background:linear-gradient(90deg,var(--bg,#070709) 0%,rgba(7,7,9,.86) 28%,transparent 100%)}
    #${RECENT_PLAYS_ID} .rpc-viewport::after{right:0;background:linear-gradient(270deg,var(--bg,#070709) 0%,rgba(7,7,9,.86) 28%,transparent 100%)}
    #${RECENT_PLAYS_ID} .rpc-card{position:absolute;left:50%;top:0;width:280px;text-align:center;transform-style:preserve-3d;transition:transform .42s cubic-bezier(.22,.75,.2,1),opacity .32s ease;pointer-events:none}
    #${RECENT_PLAYS_ID} .rpc-drag-zone{position:relative;width:280px;height:280px;margin:0 auto;pointer-events:auto;cursor:grab;touch-action:none}
    #${RECENT_PLAYS_ID}.is-dragging .rpc-drag-zone{cursor:grabbing}
    #${RECENT_PLAYS_ID} .rpc-cd{position:absolute;inset:0;border-radius:50%;background:#17171c center/cover no-repeat;box-shadow:0 20px 35px rgba(0,0,0,.42);animation:rpc-spin 18s linear infinite;will-change:transform;transform:rotateX(var(--rpc-x,0deg)) rotateY(var(--rpc-y,0deg));transition:filter .2s ease}
    #${RECENT_PLAYS_ID} .rpc-cd::before{content:"";position:absolute;left:50%;top:50%;width:54px;height:54px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle at center,#08080b 0 17%,#24242a 18% 31%,#0b0b0f 32% 42%,rgba(0,0,0,.78) 43% 100%);box-shadow:0 0 0 2px rgba(255,255,255,.12),inset 0 0 8px rgba(0,0,0,.9);z-index:3}
    #${RECENT_PLAYS_ID} .rpc-cd::after{content:"";position:absolute;inset:5%;border-radius:50%;background:repeating-radial-gradient(circle,transparent 0 22px,rgba(255,255,255,.035) 23px 24px);mix-blend-mode:screen;pointer-events:none}
    @keyframes rpc-spin{from{rotate:0deg}to{rotate:360deg}}
    #${RECENT_PLAYS_ID} .rpc-cover-fallback{position:absolute;inset:0;border-radius:50%;display:grid;place-items:center;background:#17171c;color:#777}
    #${RECENT_PLAYS_ID} .rpc-info{margin:14px auto 0;width:100%;padding:0 12px;line-height:1.25}
    #${RECENT_PLAYS_ID} .rpc-info strong,#${RECENT_PLAYS_ID} .rpc-info small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #${RECENT_PLAYS_ID} .rpc-info strong{font-size:13px;font-weight:700;color:#eee}
    #${RECENT_PLAYS_ID} .rpc-info small{margin-top:5px;font-size:10px;color:#777}
    #${RECENT_PLAYS_ID} .rpc-boundary{position:absolute;top:105px;width:150px;height:150px;display:grid;place-items:center;opacity:.2;pointer-events:none;z-index:1}
    #${RECENT_PLAYS_ID} .rpc-boundary.left{left:-32px}#${RECENT_PLAYS_ID} .rpc-boundary.right{right:-32px}
    #${RECENT_PLAYS_ID} .rpc-boundary-card{width:110px;height:110px;border:1px solid rgba(255,255,255,.08);border-radius:50%;display:grid;place-items:center;align-content:center;gap:5px;background:rgba(255,255,255,.018);box-shadow:0 12px 30px rgba(0,0,0,.22)}
    #${RECENT_PLAYS_ID} .rpc-boundary-card b{font-size:13px;color:#aaa}#${RECENT_PLAYS_ID} .rpc-boundary-card small{font-size:7px;letter-spacing:.12em;color:#666}
    #${RECENT_PLAYS_ID} .rpc-hint{text-align:center;margin-top:-2px;font-size:9px;letter-spacing:.08em;color:#555}
    @media(max-width:700px){#${RECENT_PLAYS_ID} .rpc-viewport{height:350px}#${RECENT_PLAYS_ID} .rpc-drag-zone,#${RECENT_PLAYS_ID} .rpc-card{width:240px}#${RECENT_PLAYS_ID} .rpc-drag-zone,#${RECENT_PLAYS_ID} .rpc-cd{height:240px}#${RECENT_PLAYS_ID} .rpc-boundary{display:none}}
  `;
  document.head.appendChild(style);
}

function renderRecentCarousel(section,tracks,active=0,animate=true){
  const items=tracks.slice(0,RECENT_MAX_TRACKS);
  const safe=Math.max(0,Math.min(active,Math.max(0,items.length-1)));
  section.dataset.active=String(safe);
  section.innerHTML=`
    <div class="rpc-heading"><h3>✦ RECENT PLAYS · ${items.length}</h3></div>
    <div class="rpc-boundary left"><div class="rpc-boundary-card"><b>last.fm</b><small>START</small></div></div>
    <div class="rpc-boundary right"><div class="rpc-boundary-card"><b>last.fm</b><small>END</small></div></div>
    <div class="rpc-viewport"><div class="rpc-cards"></div></div>
    <div class="rpc-hint">drag the CD to explore recent plays</div>`;

  const viewport=section.querySelector(".rpc-viewport");
  const cards=section.querySelector(".rpc-cards");
  cards.style.position="relative";cards.style.width="100%";cards.style.height="100%";cards.style.transformStyle="preserve-3d";

  items.forEach((track,index)=>{
    const name=track?.name||"Unknown track";
    const artist=track?.artist?.["#text"]||track?.artist?.name||"Unknown artist";
    const cover=recentBestImage(track);
    const card=document.createElement("article");
    card.className=`rpc-card${index===safe?" is-active":""}`;
    card.dataset.index=String(index);
    const zone=document.createElement("div");
    zone.className="rpc-drag-zone";
    zone.title="Drag to browse recent plays";
    const cd=document.createElement("div");
    cd.className="rpc-cd";
    if(cover) cd.style.backgroundImage=`url("${recentEsc(cover)}")`;
    else cd.innerHTML="";
    const fallback=document.createElement("div");
    fallback.className="rpc-cover-fallback";
    fallback.textContent="♪";
    if(!cover) zone.appendChild(fallback);
    zone.appendChild(cd);
    const info=document.createElement("div");
    info.className="rpc-info";
    info.innerHTML=`<strong>${recentEsc(name)}</strong><small>${recentEsc(artist)}</small>`;
    card.append(zone,info);
    cards.appendChild(card);

    const updateTilt=(event)=>{
      if(index!==safe)return;
      const rect=zone.getBoundingClientRect();
      const x=Math.max(-1,Math.min(1,(event.clientX-rect.left-rect.width/2)/(rect.width/2)));
      const y=Math.max(-1,Math.min(1,(event.clientY-rect.top-rect.height/2)/(rect.height/2)));
      cd.style.setProperty("--rpc-x",`${(-y*10).toFixed(2)}deg`);
      cd.style.setProperty("--rpc-y",`${(x*10).toFixed(2)}deg`);
    };
    const resetTilt=()=>{cd.style.setProperty("--rpc-x","0deg");cd.style.setProperty("--rpc-y","0deg")};
    zone.addEventListener("mousemove",updateTilt,{passive:true});
    zone.addEventListener("mouseleave",resetTilt,{passive:true});
  });

  const updatePositions=()=>{
    [...cards.children].forEach((card,index)=>{
      const offset=index-safe;
      const distance=Math.abs(offset);
      card.style.transform=`translateX(calc(-50% + ${offset*RECENT_STEP}px)) translateZ(${offset===0?35:Math.max(0,14-distance*4)}px) rotateY(${offset*-18}deg) scale(${offset===0?1:Math.max(.66,1-distance*.1)})`;
      card.style.opacity=distance>3?"0":String(Math.max(.2,1-distance*.22));
      card.style.zIndex=String(30-distance);
      card.style.transition=animate?"transform .42s cubic-bezier(.22,.75,.2,1),opacity .32s ease":"none";
    });
  };
  updatePositions();

  let pointerId=null,startX=0,lastX=0,distance=0;
  const activeZone=()=>cards.children[safe]?.querySelector(".rpc-drag-zone");
  const finish=(element,id)=>{try{if(element?.hasPointerCapture?.(id))element.releasePointerCapture(id)}catch{}pointerId=null;section.classList.remove("is-dragging");distance=0};
  const onDown=(event)=>{if(event.button!==0&&event.pointerType==="mouse")return;pointerId=event.pointerId;startX=lastX=event.clientX;distance=0;section.classList.add("is-dragging");try{event.currentTarget.setPointerCapture(pointerId)}catch{}};
  const onMove=(event)=>{if(pointerId!==event.pointerId)return;const delta=event.clientX-lastX;if(!delta)return;distance+=Math.abs(delta);lastX=event.clientX;if(distance>=110){const next=safe+(lastX<startX?1:-1);const bounded=Math.max(0,Math.min(next,items.length-1));if(bounded!==safe){finish(event.currentTarget,event.pointerId);renderRecentCarousel(section,tracks,bounded,true)}}};
  const onUp=(event)=>{if(pointerId===event.pointerId)finish(event.currentTarget,event.pointerId)};
  const zone=activeZone();
  if(zone){zone.addEventListener("pointerdown",onDown);zone.addEventListener("pointermove",onMove);zone.addEventListener("pointerup",onUp);zone.addEventListener("pointercancel",onUp);zone.addEventListener("lostpointercapture",()=>{if(pointerId!=null)finish(zone,pointerId)})}
  viewport.tabIndex=0;
  viewport.addEventListener("keydown",event=>{if(event.key!=="ArrowLeft"&&event.key!=="ArrowRight")return;const next=safe+(event.key==="ArrowRight"?1:-1);if(next>=0&&next<items.length)renderRecentCarousel(section,tracks,next,true)});
}

async function loadRecentPlaysCarousel(){
  const music=document.getElementById("music");if(!music)return;
  addRecentPlaysStyles();
  let section=document.getElementById(RECENT_PLAYS_ID);
  if(!section){section=document.createElement("div");section.id=RECENT_PLAYS_ID;const layout=music.querySelector(".music-layout");if(!layout)return;layout.insertAdjacentElement("afterend",section)}
  if(section.dataset.loading==="1")return;
  section.dataset.loading="1";
  try{
    const response=await fetch("/api/lastfm?type=recent",{cache:"no-store"});
    if(!response.ok)throw Error("Last.fm unavailable");
    const tracks=(await response.json())?.recenttracks?.track||[];
    renderRecentCarousel(section,tracks,0,false);
  }catch{section.innerHTML=""}
  finally{section.dataset.loading="0";section.dataset.loaded="1"}
}

function startRecentPlaysCarousel(){
  addRecentPlaysStyles();
  let tries=0;
  const run=()=>{if(document.getElementById("music")){loadRecentPlaysCarousel();if(++tries>=12)clearInterval(timer)}};
  run();
  const timer=setInterval(run,1000);
  const observer=new MutationObserver(()=>{if(document.getElementById("music"))loadRecentPlaysCarousel()});
  observer.observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",startRecentPlaysCarousel,{once:true});else startRecentPlaysCarousel();
