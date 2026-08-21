const RECENT_PLAYS_ID = "recent-plays-carousel";

function recentBestImage(track){
  const images = track?.image;
  if(Array.isArray(images)){
    for(let i=images.length-1;i>=0;i--){
      const v=images[i]?.["#text"];
      if(typeof v==="string"&&v.trim()&&!v.includes("undefined")) return v.trim();
    }
  }
  return "";
}

function recentEsc(v){
  return String(v||"").replace(/[&<>\"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
}

function addRecentPlaysStyles(){
  if(document.getElementById("recent-plays-carousel-styles"))return;
  const s=document.createElement("style");
  s.id="recent-plays-carousel-styles";
  s.textContent=`
    #${RECENT_PLAYS_ID}{margin-top:28px}
    #${RECENT_PLAYS_ID} .recent-carousel-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:12px}
    #${RECENT_PLAYS_ID} .recent-carousel-heading h3{margin:0;font-size:11px;letter-spacing:.14em;font-weight:700;color:#aaa}
    #${RECENT_PLAYS_ID} .recent-carousel-hint{font-size:10px;color:#666;white-space:nowrap}
    #${RECENT_PLAYS_ID} .recent-track-row{display:flex;gap:12px;overflow-x:auto;overflow-y:hidden;padding:4px 2px 12px;scroll-snap-type:x proximity;scroll-behavior:smooth;cursor:grab;overscroll-behavior-x:contain;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.22) transparent}
    #${RECENT_PLAYS_ID} .recent-track-row::-webkit-scrollbar{height:6px}
    #${RECENT_PLAYS_ID} .recent-track-row::-webkit-scrollbar-track{background:transparent;border-radius:999px}
    #${RECENT_PLAYS_ID} .recent-track-row::-webkit-scrollbar-thumb{background:rgba(255,255,255,.22);border-radius:999px;border:1px solid transparent;background-clip:padding-box}
    #${RECENT_PLAYS_ID} .recent-track-row:hover::-webkit-scrollbar-thumb{background:rgba(255,255,255,.34);background-clip:padding-box}
    #${RECENT_PLAYS_ID} .recent-track-row::-webkit-scrollbar-thumb:active{background:rgba(255,255,255,.48);background-clip:padding-box}
    #${RECENT_PLAYS_ID} .recent-track-row::-webkit-scrollbar-button{display:none;width:0;height:0}
    #${RECENT_PLAYS_ID} .recent-track-row:active{cursor:grabbing}
    #${RECENT_PLAYS_ID} .recent-track-card{position:relative;flex:0 0 174px;scroll-snap-align:start;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.025);border-radius:10px;padding:9px;overflow:hidden;cursor:pointer;transition:transform .18s ease,border-color .18s ease,background .18s ease}
    #${RECENT_PLAYS_ID} .recent-track-card:hover{transform:translateY(-3px);border-color:rgba(255,255,255,.15);background:rgba(255,255,255,.045)}
    #${RECENT_PLAYS_ID} .recent-track-art{width:100%;aspect-ratio:1;border-radius:7px;object-fit:cover;display:block;background:#17171c;box-shadow:0 8px 20px rgba(0,0,0,.25)}
    #${RECENT_PLAYS_ID} .recent-track-art.empty{display:grid;place-items:center;color:#555;font-size:25px}
    #${RECENT_PLAYS_ID} .recent-track-info{padding:9px 2px 2px;min-width:0}
    #${RECENT_PLAYS_ID} .recent-track-name{display:block;font-size:12px;font-weight:700;color:#eee;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #${RECENT_PLAYS_ID} .recent-track-artist{display:block;margin-top:3px;font-size:10px;color:#777;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #${RECENT_PLAYS_ID} .recent-track-now{position:absolute;top:15px;left:15px;padding:4px 6px;border-radius:5px;background:rgba(0,0,0,.72);font-size:8px;font-weight:800;letter-spacing:.08em;color:#fff}
    @media(max-width:700px){
      #${RECENT_PLAYS_ID}{margin-top:22px}
      #${RECENT_PLAYS_ID} .recent-carousel-hint{display:none}
      #${RECENT_PLAYS_ID} .recent-track-card{flex-basis:148px}
      #${RECENT_PLAYS_ID} .recent-track-row{padding-bottom:10px;scrollbar-width:thin}
      #${RECENT_PLAYS_ID} .recent-track-row::-webkit-scrollbar{height:5px}
    }
  `;
  document.head.appendChild(s);
}

async function loadRecentPlaysCarousel(){
  const music=document.getElementById("music");
  if(!music)return;
  addRecentPlaysStyles();
  let section=document.getElementById(RECENT_PLAYS_ID);
  if(!section){
    section=document.createElement("div");
    section.id=RECENT_PLAYS_ID;
    const layout=music.querySelector(".music-layout");
    if(!layout)return;
    layout.insertAdjacentElement("afterend",section);
  }
  if(section.dataset.loading==="1"||section.dataset.loaded==="1")return;
  section.dataset.loading="1";
  try{
    const r=await fetch("/api/lastfm?type=recent",{cache:"no-store"});
    if(!r.ok)throw Error("Recent plays unavailable");
    const tracks=r?.ok?(await r.json())?.recenttracks?.track||[]:[];
    const visible=tracks.slice(0,20);
    section.innerHTML=`<div class="recent-carousel-heading"><h3>✦ RECENT PLAYS · 20</h3><span class="recent-carousel-hint">scroll sideways →</span></div><div class="recent-track-row" tabindex="0" aria-label="20 recent plays"></div>`;
    const row=section.querySelector(".recent-track-row");
    visible.forEach((track,index)=>{
      const name=track?.name||"Unknown track";
      const artist=track?.artist?.["#text"]||track?.artist?.name||"Unknown artist";
      const cover=recentBestImage(track);
      const now=track?.["@attr"]?.nowplaying==="true";
      const card=document.createElement("div");
      card.className="recent-track-card";
      card.tabIndex=0;
      card.setAttribute("role","link");
      card.innerHTML=`${cover?`<img class="recent-track-art" src="${recentEsc(cover)}" alt="${recentEsc(name)} album cover" loading="lazy">`:`<div class="recent-track-art empty">♪</div>`}<div class="recent-track-info"><strong class="recent-track-name">${recentEsc(name)}</strong><small class="recent-track-artist">${recentEsc(artist)}</small></div>${now?'<span class="recent-track-now">NOW</span>':''}`;
      const url=`https://www.last.fm/music/${encodeURIComponent(artist).replace(/%20/g,"+")}/_/${encodeURIComponent(name).replace(/%20/g,"+")}`;
      const open=()=>window.open(url,"_blank","noopener,noreferrer");
      card.addEventListener("click",open);
      card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open()}});
      row.appendChild(card);
    });
    section.dataset.loaded="1";
    section.dataset.loading="0";
  }catch(e){
    section.dataset.loading="0";
    section.innerHTML="";
  }
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

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",startRecentPlaysCarousel,{once:true});
else startRecentPlaysCarousel();
