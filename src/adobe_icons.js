const icons={
  "After Effects":"https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/adobeaftereffects.svg",
  "Photoshop":"https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/adobephotoshop.svg"
};
function replaceAdobeIcons(){
  document.querySelectorAll("#skills .pill").forEach(pill=>{
    const name=pill.textContent.trim();
    const src=icons[name];
    if(!src || pill.querySelector("img.adobe-real-icon")) return;
    const old=pill.querySelector("svg");
    if(old) old.remove();
    const img=document.createElement("img");
    img.src=src;
    img.alt=name;
    img.className="adobe-real-icon";
    img.width=11;
    img.height=11;
    img.style.display="block";
    img.style.filter="invert(70%)";
    pill.prepend(img);
  });
}
function run(){replaceAdobeIcons();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});
else run();
new MutationObserver(run).observe(document.getElementById("root"),{childList:true,subtree:true});
