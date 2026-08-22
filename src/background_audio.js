const BG_AUDIO_SRC="/audio/background.mp3";
const BG_AUDIO_VOLUME_KEY="draven-bg-volume";
const BG_AUDIO_MUTED_KEY="draven-bg-muted";
const BG_AUDIO_STYLE_ID="draven-background-audio-styles";

function installBackgroundAudio(){
  if(document.getElementById("draven-background-audio"))return;
  const audio=document.createElement("audio");
  audio.id="draven-background-audio";
  audio.src=BG_AUDIO_SRC;
  audio.loop=true;
  audio.preload="auto";
  audio.setAttribute("aria-hidden","true");
  audio.style.display="none";
  document.body.appendChild(audio);
  const savedVolume=Number.parseFloat(localStorage.getItem(BG_AUDIO_VOLUME_KEY));
  const volume=Number.isFinite(savedVolume)?Math.min(1,Math.max(0,savedVolume)):0.35;
  const savedMuted=localStorage.getItem(BG_AUDIO_MUTED_KEY)==="1";
  audio.volume=volume;
  audio.muted=savedMuted;
  const playFromEntry=()=>{if(audio.muted||audio.volume===0)return;audio.play().catch(()=>{})};
  window.addEventListener("pointerdown",playFromEntry,{capture:true});
  window.addEventListener("keydown",e=>{if(e.key!=="Enter"&&e.key!==" ")return;playFromEntry()},{capture:true});
  const style=document.createElement("style");style.id=BG_AUDIO_STYLE_ID;style.textContent=`
.draven-audio-control{position:fixed;right:78px;bottom:12px;z-index:41;height:29px;box-sizing:border-box;display:flex;align-items:center;gap:7px;padding:0 8px;border:1px solid #292930;border-radius:5px;background:#101014cc;backdrop-filter:blur(8px);box-shadow:0 8px 25px #0004}.draven-audio-mute{width:17px;height:17px;padding:0;border:0;background:transparent;color:#666;display:grid;place-items:center;cursor:none;transition:color .18s ease,transform .18s ease}.draven-audio-mute:hover{color:#ddd;transform:scale(1.08)}.draven-audio-mute svg{width:12px;height:12px;display:block}.draven-audio-slider{width:70px;height:18px;margin:0;padding:0;background:transparent;appearance:none;-webkit-appearance:none;cursor:none}.draven-audio-slider::-webkit-slider-runnable-track{height:3px;background:#292930;border-radius:999px}.draven-audio-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:10px;height:10px;margin-top:-3.5px;border-radius:50%;background:#9a62c4;border:0;box-shadow:0 0 7px #6a029755}.draven-audio-slider::-moz-range-track{height:3px;background:#292930;border-radius:999px}.draven-audio-slider::-moz-range-thumb{width:10px;height:10px;border-radius:50%;background:#9a62c4;border:0;box-shadow:0 0 7px #6a029755}@media(max-width:500px){.draven-audio-control{right:68px}.draven-audio-slider{width:55px}}`;document.head.appendChild(style);
  const makeIcon=muted=>muted?`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m19 9-5 6m0-6 5 6"/></svg>`:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12"/></svg>`;
  const control=document.createElement("div");control.className="draven-audio-control";control.setAttribute("aria-label","Background music controls");control.innerHTML=`<button class="draven-audio-mute" type="button" aria-label="Mute background music" title="Mute background music">${makeIcon(audio.muted)}</button><input class="draven-audio-slider" type="range" min="0" max="1" step="0.01" value="${volume}" aria-label="Background music volume" title="Background music volume">`;document.body.appendChild(control);
  const muteButton=control.querySelector(".draven-audio-mute"),slider=control.querySelector(".draven-audio-slider");
  const save=()=>{localStorage.setItem(BG_AUDIO_VOLUME_KEY,String(audio.volume));localStorage.setItem(BG_AUDIO_MUTED_KEY,audio.muted?"1":"0")};
  const refreshMute=()=>{const muted=audio.muted||audio.volume===0;muteButton.innerHTML=makeIcon(muted);muteButton.setAttribute("aria-label",muted?"Unmute background music":"Mute background music");muteButton.title=muted?"Unmute background music":"Mute background music"};
  slider.addEventListener("input",()=>{audio.volume=Number(slider.value);if(audio.volume>0)audio.muted=false;save();refreshMute()});
  muteButton.addEventListener("click",()=>{if(audio.muted||audio.volume===0){const restore=Number.parseFloat(localStorage.getItem(BG_AUDIO_VOLUME_KEY));const next=Number.isFinite(restore)&&restore>0?restore:0.35;audio.volume=next;slider.value=String(next);audio.muted=false}else audio.muted=true;save();refreshMute()});
  refreshMute();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",installBackgroundAudio,{once:true});else installBackgroundAudio();
