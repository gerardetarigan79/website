const RAW_BADGES = "https://raw.githubusercontent.com/Fmasterpro27/Discord-badges/main/assets";
const F1_TRACKS = {
  "Dutch Grand Prix": "https://commons.wikimedia.org/wiki/Special:FilePath/Zandvoort.svg",
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
    .actual-badge.gift-badge{width:16px;height:16px}
    .flip.real-flip{transform-style:preserve-3d;backface-visibility:hidden;transform-origin:50% 50%;animation:dravenFlip .48s cubic-bezier(.4,0,.2,1)}
    @keyframes dravenFlip{0%{transform:perspective(180px) rotateX(0deg)}45%{transform:perspective(180px) rotateX(-88deg)}55%{transform:perspective(180px) rotateX(88deg)}100%{transform:perspective(180px) rotateX(0deg)}}
    .recent-card.song-link{cursor:pointer}
    .recent-card.song-link:hover strong,.np-song-link:hover strong{color:#fff}
    .artist-art{width:32px!important;height:32px!important;border-radius:50%!important;object-fit:cover!important;background:#1a1a20;display:block!important}
    .f1-hero{background:linear-gradient(145deg,#101014,#0b0b0e)!important;box-shadow:0 24px 70px #0008!important}
    .f1-mark{color:#9a9aa2!important}.f1-logo{color:#aaa!important;opacity:.08!important}
    .interest{background:#0d0d10!important;border-color:#24242a!important}
    .f1-points,.next-race{background:#0d0d10!important;border-color:#24242a!important}
    .f1-points .bar{background:#1b1b20!important}.f1-points .bar span{background:#777!important}
    .f1-asset{width:38px;height:38px;object-fit:contain;display:block;filter:grayscale(.15) brightness(.88);border-radius:5px}
    .driver-number{width:42px;height:42px;display:grid;place-items:center;font-family:Arial Black,Arial,sans-serif;font-size:31px;font-weight:900;font-style:italic;color:#d7d7dc;letter-spacing:-.08em;transform:skew(-8deg)}
    .track-preview{width:50px;height:42px;object-fit:contain;filter:invert(1) brightness(.72) contrast(1.15);opacity:.9}
    .f1-interest-grid .interest>span:has(.f1-asset),.f1-interest-grid .interest>span:has(.track-preview){width:50px;height:42px;background:transparent}
  `;
  document.head.appendChild(style);
}

function giftSvg(){
  const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox","0 0 24 24");svg.classList.add("actual-badge","gift-badge");
  svg.innerHTML='<rect x="4" y="9" width="16" height="11" rx="2" fill="none" stroke="#c7c7cf" stroke-width="2"/><path d="M3 9h18v4H3zM12 9v11M12 9H8.5a2.5 2.5 0 1 1 2.5-2.5C11 8 12 9 12 9Zm0 0h3.5A2.5 2.5 0 1 0 13 6.5C13 8 12 9 12 9Z" fill="none" stroke="#c7c7cf" stroke-width="2" stroke-linejoin="round"/>';
  svg.title="Gifting Badge";return svg;
}

function decorateDiscord(){
  const info=document.querySelector(".discord-info");
  if(!info)return;
  let box=info.querySelector(".badges");
  if(!box){box=document.createElement("div");box.className="badges";info.appendChild(box)}
  if(box.dataset.actualBadges)return;
  box.dataset.actualBadges="1";box.classList.add("actual-badges");box.innerHTML="";
  [[RAW_BADGES+"/profile_badges/discordnitro.svg","Discord Nitro badge"],[RAW_BADGES+"/nitro_booster/discordboost1.svg","Server Booster badge"]].forEach(([src,title])=>{
    const img=document.createElement("img");img.className="actual-badge";img.src=src;img.alt=title;img.title=title;box.appendChild(img);
  });
  box.appendChild(giftSvg());
}

function flipDigits(){
  document.querySelectorAll(".flip").forEach(el=>{
    const value=el.textContent;
    if(el.dataset.lastValue===undefined){el.dataset.lastValue=value;return}
    if(el.dataset.lastValue!==value){el.dataset.lastValue=value;el.classList.remove("real-flip");void el.offsetWidth;el.classList.add("real-flip")}
  });
}

function lastfmUrl(artist,track){return artist&&track?`https://www.last.fm/music/${encodeURIComponent(artist)}/_/${encodeURIComponent(track)}`:""}

async function enrichArtists(){
  if(window.__dravenArtistsLoading)return;
  window.__dravenArtistsLoading=true;
  try{
    const data=await (await fetch("/api/lastfm?type=artists")).json();
    const map=new Map((data?.topartists?.artist||[]).map(a=>[String(a.name).toLowerCase(),a]));
    document.querySelectorAll(".music-list:first-child .music-item").forEach(item=>{
      const name=item.querySelector("strong")?.textContent?.trim(),artist=map.get(name?.toLowerCase());if(!artist)return;
      const url=artist.image?.[4]?.["#text"]||artist.image?.[3]?.["#text"]||artist.image?.[2]?.["#text"]||artist.image?.[1]?.["#text"];if(!url)return;
      const old=item.querySelector("img");
      if(old){old.src=url;old.classList.add("artist-art");old.style.display="block"}
      else{const art=document.createElement("img");art.src=url;art.alt="";art.className="artist-art";item.insertBefore(art,item.children[2])}
    });
  }catch(e){}finally{window.__dravenArtistsLoading=false}
}

function linkMusic(){
  document.querySelectorAll(".recent-card").forEach(card=>{
    if(card.classList.contains("skeleton-recent")||card.dataset.linked)return;
    const track=card.querySelector("strong")?.textContent?.trim(),artist=card.querySelector("small")?.textContent?.trim(),url=lastfmUrl(artist,track);if(!url)return;
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

function decorateF1(){
  const interests=document.querySelectorAll(".f1-interest-grid .interest");if(interests.length<3)return;
  if(!interests[0].dataset.asset){interests[0].dataset.asset="1";const span=interests[0].querySelector(":scope > span");if(span){span.innerHTML="";const img=document.createElement("img");img.className="f1-asset";img.src="https://commons.wikimedia.org/wiki/Special:FilePath/F1_Team_Icon_-_Ferrari%282009%29.svg";img.alt="Scuderia Ferrari";img.title="Scuderia Ferrari HP";span.appendChild(img)}}
  if(!interests[1].dataset.asset){interests[1].dataset.asset="1";const span=interests[1].querySelector(":scope > span");if(span){span.innerHTML="";const n=document.createElement("div");n.className="driver-number";n.textContent="3";n.title="Max Verstappen • #3 in 2026";span.appendChild(n)}}
  const next=interests[2],small=next.querySelector("small")?.textContent||"";
  const race=Object.keys(F1_TRACKS).find(k=>small.includes(k.replace(" Grand Prix","")))||(small.includes("Netherlands")?"Dutch Grand Prix":null);
  if(race&&!next.dataset.track){next.dataset.track="1";const span=next.querySelector(":scope > span");if(span){span.innerHTML="";const img=document.createElement("img");img.className="track-preview";img.src=F1_TRACKS[race];img.alt="";img.title=race+" circuit";span.appendChild(img)}}
}

function run(){addStyles();decorateDiscord();flipDigits();linkMusic();decorateF1();if(document.querySelector("#music"))enrichArtists()}
const observer=new MutationObserver(run);observer.observe(document.getElementById("root")||document.body,{childList:true,subtree:true,characterData:true});
setInterval(run,1000);if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
