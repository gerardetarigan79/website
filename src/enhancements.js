const RAW_BADGES = "https://raw.githubusercontent.com/Fmasterpro27/Discord-badges/main/assets";
const F1_TRACKS = {
  "Dutch Grand Prix": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Zandvoort.svg",
  "Italian Grand Prix": "https://commons.wikimedia.org/wiki/Special:FilePath/Monza.svg",
  "Azerbaijan Grand Prix": "https://commons.wikimedia.org/wiki/Special:FilePath/Baku.svg",
  "Singapore Grand Prix": "https://commons.wikimedia.org/wiki/Special:FilePath/Marina_Bay_Street_Circuit.svg",
  "Japanese Grand Prix": "https://commons.wikimedia.org/wiki/Special:FilePath/Suzuka_circuit_map.svg",
  "British Grand Prix": "https://commons.wikimedia.org/wiki/Special:FilePath/Silverstone_Circuit.svg",
  "Belgian Grand Prix": "https://commons.wikimedia.org/wiki/Special:FilePath/Circuit_Spa-Francorchamps.svg",
  "Hungarian Grand Prix": "https://commons.wikimedia.org/wiki/Special:FilePath/Hungaroring.svg",
  "Austrian Grand Prix": "https://commons.wikimedia.org/wiki/Special:FilePath/Red_Bull_Ring.svg",
  "Monaco Grand Prix": "https://commons.wikimedia.org/wiki/Special:FilePath/Monte_Carlo_Formula_1_track_map.svg"
};

function addStyles(){
  if(document.getElementById("draven-enhancement-styles")) return;
  const style=document.createElement("style");
  style.id="draven-enhancement-styles";
  style.textContent=`
    .badges.actual-badges{display:flex;align-items:center;gap:6px;margin-top:6px}
    .actual-badge{width:15px;height:15px;object-fit:contain;display:block;filter:drop-shadow(0 2px 5px #0008)}
    .flip.real-flip{transform-style:preserve-3d;backface-visibility:hidden;transform-origin:50% 50%;will-change:transform}
    .recent-card.song-link{cursor:pointer}
    .recent-card.song-link:hover strong,.np-song-link:hover strong{color:#fff}
    .placeholder-art{width:100%;height:100%;min-width:42px;min-height:42px;display:block;object-fit:cover;border-radius:8px;background:#15151a}
    .f1-hero{background:linear-gradient(145deg,#101014,#0b0b0e)!important;box-shadow:0 24px 70px #0008!important}
    .f1-mark{color:#9a9aa2!important}.f1-logo{color:#aaa!important;opacity:.08!important}
    .interest{background:#0d0d10!important;border-color:#24242a!important}
    .f1-points,.next-race{background:#0d0d10!important;border-color:#24242a!important}
    .f1-points .bar{background:#1b1b20!important}.f1-points .bar span{background:#777!important}
    .f1-asset{width:42px;height:42px;object-fit:contain;display:block;filter:brightness(.9);border-radius:4px}
    .driver-number{width:44px;height:44px;display:grid;place-items:center;font-family:Arial Black,Arial,sans-serif;font-size:34px;font-weight:900;font-style:italic;color:#f0f0f2;letter-spacing:-.11em;line-height:1;transform:skew(-9deg)}
    .track-preview{width:56px;height:46px;object-fit:contain;filter:invert(1) brightness(.78) contrast(1.2);opacity:.95}
    .f1-shirt{width:42px;height:42px;display:block;stroke:#d8d8dd;fill:none;stroke-width:1.6}
    .f1-interest-grid .interest>span:has(.f1-asset),.f1-interest-grid .interest>span:has(.track-preview),.f1-interest-grid .interest>span:has(.driver-number),.f1-interest-grid .interest>span:has(.f1-shirt){width:52px;height:46px;background:transparent}
  `;
  document.head.appendChild(style);
}

function decorateDiscord(){
  const info=document.querySelector(".discord-info");
  if(!info)return;
  const source=info.querySelector(".badges");
  if(source){
    [...source.querySelectorAll("span")].forEach(el=>{
      if((el.title||"").toLowerCase().includes("hypesquad bravery") || el.textContent.trim()==="BRV") el.remove();
    });
  }
  let box=info.querySelector(".badges.actual-badges");
  if(!box){box=document.createElement("div");box.className="badges actual-badges";info.appendChild(box)}
  if(box.dataset.actualBadges)return;
  box.dataset.actualBadges="1";box.innerHTML="";
  // Nitro/boost duration tiers are not exposed by Lanyard's public presence payload.
  // Keep the actual badge assets here; exact tier variants can be selected once the user's tiers are known.
  [[RAW_BADGES+"/profile_badges/discordnitro.svg","Discord Nitro badge"],[RAW_BADGES+"/nitro_booster/discordboost1.svg","Server Booster badge"]].forEach(([src,title])=>{
    const img=document.createElement("img");img.className="actual-badge";img.src=src;img.alt=title;img.title=title;box.appendChild(img);
  });
}

function flipDigits(){
  document.querySelectorAll(".flip").forEach(el=>{
    const value=el.textContent;
    if(el.dataset.lastValue===undefined){el.dataset.lastValue=value;return}
    if(el.dataset.lastValue===value)return;
    el.dataset.lastValue=value;
    if(el.__flipAnimation)el.__flipAnimation.cancel();
    el.__flipAnimation=el.animate([
      {transform:"perspective(180px) rotateX(0deg)",filter:"brightness(1)"},
      {transform:"perspective(180px) rotateX(-82deg)",filter:"brightness(.72)"},
      {transform:"perspective(180px) rotateX(0deg)",filter:"brightness(1)"}
    ],{duration:520,easing:"cubic-bezier(.4,0,.2,1)"});
  });
}

function normalizeTimezone(){
  document.querySelectorAll(".clock-meta small").forEach(el=>{
    if(el.textContent !== "UTC+7") el.textContent="UTC+7";
  });
}

function lastfmUrl(artist,track){return artist&&track?`https://www.last.fm/music/${encodeURIComponent(artist)}/_/${encodeURIComponent(track)}`:""}

function enrichArtists(){
  document.querySelectorAll(".music-layout .music-list:first-child .music-item img,.music-layout .music-list:first-child .music-item .mini-art").forEach(el=>el.remove());
}

function placeholderSvg(){
  return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="12" fill="#15151a"/><circle cx="48" cy="48" r="24" fill="none" stroke="#777780" stroke-width="4"/><path d="M39 35v26l22-13z" fill="#777780"/></svg>`);
}

function linkMusic(){
  const placeholder=placeholderSvg();
  document.querySelectorAll(".recent-card").forEach(card=>{
    if(card.classList.contains("skeleton-recent"))return;
    const img=card.querySelector("img");
    if(!img || !img.getAttribute("src")){if(img)img.src=placeholder;else{const p=document.createElement("img");p.src=placeholder;p.alt="";p.className="placeholder-art";card.insertBefore(p,card.firstChild)}}
    const track=card.querySelector("strong")?.textContent?.trim(),artist=card.querySelector("small")?.textContent?.trim(),url=lastfmUrl(artist,track);if(!url)return;
    if(card.dataset.linked)return;
    card.dataset.linked="1";card.classList.add("song-link");card.title="Open on Last.fm";
    card.addEventListener("click",()=>window.open(url,"_blank","noopener,noreferrer"));
  });
  const np=document.querySelector(".np-bottom");
  if(np){
    np.querySelector("button")?.remove();
    if(!np.dataset.linked){
      const track=np.querySelector("strong")?.textContent?.trim(),artist=np.querySelector("small")?.textContent?.split(" · ")[0]?.trim(),url=lastfmUrl(artist,track);
      if(url){np.dataset.linked="1";const text=np.querySelector("div");if(text){text.classList.add("np-song-link");text.style.cursor="pointer";text.title="Open on Last.fm";text.addEventListener("click",()=>window.open(url,"_blank","noopener,noreferrer"))}}
    }
  }
}

function shirtSvg(){
  const ns="http://www.w3.org/2000/svg";const svg=document.createElementNS(ns,"svg");svg.classList.add("f1-shirt");svg.setAttribute("viewBox","0 0 48 48");svg.innerHTML='<path d="M18 8l6 4 6-4 10 7-5 8-4-3v20H17V20l-4 3-5-8 10-7Z"/><path d="M20 9c0 4 2 6 4 6s4-2 4-6"/>';return svg;
}

function decorateF1(){
  const interests=document.querySelectorAll(".f1-interest-grid .interest");if(interests.length<4)return;
  if(!interests[0].dataset.asset){interests[0].dataset.asset="1";const span=interests[0].querySelector(":scope > span");if(span){span.innerHTML="";const img=document.createElement("img");img.className="f1-asset";img.src="https://commons.wikimedia.org/wiki/Special:FilePath/Scuderia_Ferrari_HP_logo_24.svg";img.alt="Scuderia Ferrari HP";img.title="Scuderia Ferrari HP";span.appendChild(img)}}
  if(!interests[1].dataset.asset){interests[1].dataset.asset="1";const span=interests[1].querySelector(":scope > span");if(span){span.innerHTML="";const n=document.createElement("div");n.className="driver-number";n.textContent="3";n.title="Max Verstappen • #3 (2026)";span.appendChild(n)}}
  const next=interests[2],small=next.querySelector("small")?.textContent||"";
  const race=Object.keys(F1_TRACKS).find(k=>small.includes(k.replace(" Grand Prix","")))||(small.includes("Netherlands")?"Dutch Grand Prix":null);
  if(race&&!next.dataset.track){next.dataset.track="1";const span=next.querySelector(":scope > span");if(span){span.innerHTML="";const img=document.createElement("img");img.className="track-preview";img.src=F1_TRACKS[race];img.alt="";img.title=race+" circuit";span.appendChild(img)}}
  if(!interests[3].dataset.asset){interests[3].dataset.asset="1";const span=interests[3].querySelector(":scope > span");if(span){span.innerHTML="";span.appendChild(shirtSvg())}}
}

function run(){addStyles();decorateDiscord();flipDigits();normalizeTimezone();linkMusic();decorateF1();if(document.querySelector("#music"))enrichArtists()}
const observer=new MutationObserver(run);observer.observe(document.getElementById("root")||document.body,{childList:true,subtree:true,characterData:true});
setInterval(run,1000);if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
