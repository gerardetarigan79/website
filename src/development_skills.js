const VITE_ICON = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#999999" d="M2.4 4.5h19.2L12 19.5z"/><path fill="#1b1b20" d="M12 7.1 7.7 14h2.8l1.5-2.4 1.5 2.4h2.8z"/></svg>`)}`;
const DEVELOPMENT_SKILLS = [
  ["Vite", VITE_ICON],
  ["HTML", "<>"],
  ["TypeScript", "TS"]
];

function addDevelopmentSkills(){
  const groups = document.querySelectorAll("#skills .skill-group");
  const development = [...groups].find(group =>
    group.querySelector("h3")?.textContent.trim().toLowerCase() === "development"
  );
  if(!development) return;
  const wrap = development.querySelector(".pill-wrap");
  if(!wrap || wrap.dataset.extraSkillsAdded === "1") return;
  wrap.dataset.extraSkillsAdded = "1";
  DEVELOPMENT_SKILLS.forEach(([name, icon]) => {
    if([...wrap.querySelectorAll(".pill")].some(p => p.textContent.trim() === name)) return;
    const pill = document.createElement("span");
    pill.className = "pill";
    if(name === "Vite"){
      const img = document.createElement("img");
      img.src = icon;
      img.alt = "Vite";
      img.width = 11;
      img.height = 11;
      img.style.cssText = "display:block;width:11px;height:11px;object-fit:contain;margin-right:4px";
      pill.append(img, document.createTextNode(name));
    } else {
      pill.innerHTML = `<span aria-hidden="true" style="font-size:11px;line-height:1;color:#999999">${icon}</span> ${name}`;
    }
    wrap.appendChild(pill);
  });
}

if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", addDevelopmentSkills, {once:true});
else addDevelopmentSkills();
new MutationObserver(addDevelopmentSkills).observe(document.getElementById("root") || document.body, {childList:true, subtree:true});
