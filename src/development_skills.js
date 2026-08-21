const DEVELOPMENT_SKILLS = [
  ["Vite", "⚡"],
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
    pill.innerHTML = `<span aria-hidden="true" style="font-size:11px;line-height:1;color:#999999">${icon}</span> ${name}`;
    wrap.appendChild(pill);
  });
}

if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", addDevelopmentSkills, {once:true});
else addDevelopmentSkills();
new MutationObserver(addDevelopmentSkills).observe(document.getElementById("root") || document.body, {childList:true, subtree:true});
