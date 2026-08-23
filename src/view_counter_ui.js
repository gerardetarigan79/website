function formatViewCount(value){return new Intl.NumberFormat("en-US").format(Number(String(value).replace(/,/g,""))||0)}
function styleViewCounter(){
  const el=document.querySelector(".views");
  if(!el)return;
  const match=el.textContent.match(/\d[\d,]*/);
  if(!match)return;
  const value=formatViewCount(match[0]);
  if(el.dataset.viewUiValue===value&&el.dataset.viewUiReady==="1")return;
  el.dataset.viewUiValue=value;
  el.dataset.viewUiReady="1";
  el.innerHTML=`<svg class="view-eye-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.2 12s3.6-5.2 9.8-5.2S21.8 12 21.8 12 18.2 17.2 12 17.2 2.2 12 2.2 12Z"></path><circle cx="12" cy="12" r="2.7"></circle></svg><span>Views: ${value}</span>`;
}
function installViewCounter(){
  const observer=new MutationObserver(()=>requestAnimationFrame(styleViewCounter));
  observer.observe(document.body,{childList:true,subtree:true,characterData:true});
  styleViewCounter();
  const style=document.createElement("style");
  style.textContent=`
    .views{position:fixed!important;z-index:1101!important;pointer-events:auto!important;display:flex!important;align-items:center;justify-content:center;gap:7px;min-height:30px;padding:7px 11px!important;border-radius:7px!important;font-size:9px!important;color:#777!important;line-height:1!important;white-space:nowrap;transition:transform .2s ease,border-color .2s ease,color .2s ease,box-shadow .2s ease!important}
    .views:hover{color:#bbb!important;border-color:#3a3a42!important;transform:translateY(-1px);box-shadow:0 7px 20px #0007}
    .view-eye-icon{width:15px;height:15px;flex:0 0 15px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
    .views span{display:block}
    @media(max-width:500px){.views{right:10px!important;bottom:10px!important;min-height:29px;padding:7px 10px!important;font-size:8px!important}.view-eye-icon{width:14px;height:14px;flex-basis:14px}}
  `;
  document.head.appendChild(style);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",installViewCounter,{once:true});else installViewCounter();
