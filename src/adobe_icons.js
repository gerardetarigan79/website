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
function addExtraSkills(){
  const wrap=document.querySelector("#skills .skill-group:nth-of-type(2) .pill-wrap");
  if(!wrap || wrap.dataset.extraSkillsAdded==="1") return;
  const makePill=(name,letter)=>{
    const pill=document.createElement("span");
    pill.className="pill";
    const img=document.createElement("img");
    img.className="adobe-real-icon";
    img.alt=name;
    img.width=11;
    img.height=11;
    img.style.display="block";
    img.src=`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="1" fill="#999999"/><text x="12" y="15.2" text-anchor="middle" font-family="Arial,sans-serif" font-size="${letter.length>2?"7.2":"9"}" font-weight="700" fill="#1b1b20">${letter}</text></svg>`)}`;
    pill.append(img,document.createTextNode(` ${name}`));
    return pill;
  };
  wrap.append(makePill("Vite","V"),makePill("HTML","HTML"),makePill("TypeScript","TS"));
  wrap.dataset.extraSkillsAdded="1";
}
function run(){replaceAdobeIcons();addExtraSkills();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});
else run();
new MutationObserver(run).observe(document.getElementById("root"),{childList:true,subtree:true});
