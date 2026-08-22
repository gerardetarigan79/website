const AUDIO_SRC = "/audio/backgroundaudio.mp3";
const VOLUME_KEY = "draven-bg-volume";
const MUTED_KEY = "draven-bg-muted";
const CONTROL_ID = "draven-audio-control";

function clamp(value, min = 0, max = 1) { return Math.min(max, Math.max(min, value)); }
function savedVolume() { const value = Number.parseFloat(localStorage.getItem(VOLUME_KEY) || ""); return Number.isFinite(value) ? clamp(value) : 0.25; }
function icon(muted) { return muted ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m19 9-5 6m0-6 5 6"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12"/></svg>'; }

function install() {
  if (document.getElementById(CONTROL_ID)) return;
  const audio = new Audio(AUDIO_SRC); audio.id = "draven-background-audio"; audio.loop = true; audio.preload = "auto"; audio.volume = 0; audio.muted = localStorage.getItem(MUTED_KEY) === "1"; document.body.appendChild(audio);
  const control = document.createElement("div"); control.id = CONTROL_ID; control.innerHTML = `<button type="button" class="draven-audio-mute" aria-label="Mute background music">${icon(audio.muted)}</button><input class="draven-audio-slider" type="range" min="0" max="1" step="0.01" value="${savedVolume()}" aria-label="Background music volume">`; document.body.appendChild(control);
  const style = document.createElement("style"); style.textContent = `
    #${CONTROL_ID}{position:fixed;left:12px;bottom:12px;z-index:60;height:28px;min-width:116px;padding:0 9px;display:flex;align-items:center;gap:7px;box-sizing:border-box;border:1px solid #24242a;border-radius:7px;background:#101014;color:#777;box-shadow:0 8px 25px #0006;opacity:0;visibility:hidden;transform:translateY(12px) scale(.96);transition:opacity .55s cubic-bezier(.2,.75,.2,1),transform .7s cubic-bezier(.2,.75,.2,1),visibility 0s linear .7s}
    #${CONTROL_ID}.visible{opacity:1;visibility:visible;transform:none;transition-delay:0s}
    #${CONTROL_ID} .draven-audio-mute{width:15px;height:18px;padding:0;border:0;background:transparent;color:#777;display:grid;place-items:center;cursor:none;flex:0 0 15px;transition:color .18s,transform .18s}
    #${CONTROL_ID} .draven-audio-mute:hover{color:#eee;transform:scale(1.08)} #${CONTROL_ID} .draven-audio-mute svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
    #${CONTROL_ID} .draven-audio-slider{width:72px;height:18px;margin:0;padding:0;background:transparent;appearance:none;-webkit-appearance:none;cursor:none}
    #${CONTROL_ID} .draven-audio-slider::-webkit-slider-runnable-track{height:3px;background:#292930;border-radius:999px} #${CONTROL_ID} .draven-audio-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:10px;height:10px;margin-top:-3.5px;border:0;border-radius:50%;background:#9a62c4;box-shadow:0 0 7px #6a029755}
    #${CONTROL_ID} .draven-audio-slider::-moz-range-track{height:3px;background:#292930;border-radius:999px} #${CONTROL_ID} .draven-audio-slider::-moz-range-thumb{width:10px;height:10px;border:0;border-radius:50%;background:#9a62c4;box-shadow:0 0 7px #6a029755}
    @media(max-width:500px){#${CONTROL_ID}{left:10px;min-width:100px}.draven-audio-slider{width:58px}}
  `; document.head.appendChild(style);
  const button = control.querySelector(".draven-audio-mute"), slider = control.querySelector(".draven-audio-slider"), targetVolume = Number(slider.value);
  function persist(){localStorage.setItem(VOLUME_KEY,String(clamp(audio.volume)));localStorage.setItem(MUTED_KEY,audio.muted?"1":"0")}
  function refreshButton(){const muted=audio.muted||audio.volume===0;button.innerHTML=icon(muted);button.setAttribute("aria-label",muted?"Unmute background music":"Mute background music")}
  function reveal(){if(document.querySelector(".entry"))return false;requestAnimationFrame(()=>control.classList.add("visible"));return true}
  function fadeIn(){if(audio.muted||targetVolume<=0)return;const start=performance.now(),duration=3500,tick=now=>{const progress=Math.min(1,(now-start)/duration);audio.volume=targetVolume*(progress*progress*(3-2*progress));if(progress<1)requestAnimationFrame(tick);else persist()};requestAnimationFrame(tick)}
  function enter(){if(audio.dataset.started==="1")return;audio.dataset.started="1";audio.volume=0;audio.play().then(fadeIn).catch(()=>{delete audio.dataset.started})}
  const entry=document.querySelector(".entry"); if(entry){entry.addEventListener("pointerdown",enter,{once:true,capture:true});entry.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" ")enter()},{once:true,capture:true})}else{window.addEventListener("pointerdown",enter,{once:true,capture:true});window.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" ")enter()},{once:true,capture:true})}
  slider.addEventListener("input",()=>{audio.volume=Number(slider.value);audio.muted=audio.volume===0;persist();refreshButton()}); button.addEventListener("click",()=>{if(audio.muted||audio.volume===0){const restore=savedVolume()||0.25;audio.volume=restore;slider.value=String(restore);audio.muted=false}else audio.muted=true;persist();refreshButton()}); refreshButton();
  let tries=0;const waitForEntry=setInterval(()=>{if(reveal()||++tries>100)clearInterval(waitForEntry)},100);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
