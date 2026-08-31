(() => {
  const DISCORD_ID = "715076381293150288";
  const API = `https://api.lanyard.rest/v1/users/${DISCORD_ID}`;
  const STYLE_ID = "discord-rich-presence-styles";
  let lastCard = null;

  const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .discord-card.rich-presence-card{display:flex;align-items:flex-start;gap:12px;position:relative}
      .rich-presence-main{min-width:0;flex:1}
      .rich-presence-top{display:flex;align-items:center;gap:8px;min-width:0}
      .rich-presence-name{font-size:11px;color:#ddd;font-weight:400;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .rich-presence-tag{font-size:8px;color:#555;white-space:nowrap}
      .rich-presence-status{display:flex;align-items:center;gap:7px;margin-top:3px;font-size:8px;color:#666}
      .rich-presence-devices{display:flex;align-items:center;gap:5px;margin-left:1px}
      .rich-presence-device{display:grid;place-items:center;color:#777;width:14px;height:14px}
      .rich-presence-device svg{width:11px;height:11px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
      .rich-presence-activities{display:flex;flex-direction:column;gap:4px;margin-top:7px;min-width:0}
      .rich-activity{display:flex;align-items:baseline;gap:5px;min-width:0;color:#777;font-size:7px;line-height:1.35}
      .rich-activity-name{display:block;color:#777;font-size:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
      .rich-activity-time{display:inline;color:#555;font-size:7px;flex:0 0 auto;white-space:nowrap}
      .rich-presence-empty{margin-top:6px;color:#555;font-size:8px}
      .rich-presence-card .avatar-wrap{flex:0 0 auto}
      .rich-presence-card .badges{display:flex;align-items:center;gap:4px;margin-top:4px}
      .rich-presence-card .badges img{width:16px;height:16px;object-fit:contain;display:block}
      @media(max-width:620px){.rich-presence-card .small-action{display:none}.rich-activity-name{max-width:100%}}
    `;
    document.head.appendChild(style);
  };

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
  const formatElapsed = (start) => { if (!start) return ""; const seconds=Math.max(0,Math.floor((Date.now()-start)/1000)); const h=Math.floor(seconds/3600),m=Math.floor((seconds%3600)/60),s=seconds%60; return h?`${h}h ${String(m).padStart(2,"0")}m`:`${m}m ${String(s).padStart(2,"0")}s`; };
  const formatRemaining = (end) => { if (!end) return ""; const seconds=Math.max(0,Math.floor((end-Date.now())/1000)); if(!seconds)return "ended"; const h=Math.floor(seconds/3600),m=Math.floor((seconds%3600)/60),s=seconds%60; return h?`ends ${h}h ${String(m).padStart(2,"0")}m`:`ends ${m}m ${String(s).padStart(2,"0")}s`; };
  const activityType = (activity) => ["Playing","Streaming","Listening to","Watching","Custom Status","Competing in"][activity?.type] || "Activity";
  const deviceIcon = (device) => device === "desktop" ? `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M8 20h8M12 17v3"/></svg>` : device === "mobile" ? `<svg viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M10 5h4M11 18.5h2"/></svg>` : `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>`;

  const render = (card, data) => {
    if (!card || !data) return;
    injectStyles();
    const user=data.discord_user||{};
    const avatar=user.avatar?`https://cdn.discordapp.com/avatars/${DISCORD_ID}/${user.avatar}.${user.avatar.startsWith("a_")?"gif":"png"}?size=128`:`https://api.lanyard.rest/${DISCORD_ID}.png`;
    const decoration=user.avatar_decoration_data?.asset?`https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=128`:"";
    const status=data.discord_status||"offline";
    const devices=[]; if(data.active_on_discord_desktop)devices.push("desktop"); if(data.active_on_discord_mobile)devices.push("mobile"); if(data.active_on_discord_web)devices.push("web");
    const activities=(data.activities||[]).filter(a=>a&&a.name!=="Spotify"&&a.type!==4);
    const activityCards=activities.map(activity=>{const start=activity.timestamps?.start,end=activity.timestamps?.end,time=start?formatElapsed(start):formatRemaining(end),description=[activityType(activity),activity.name||"Unknown activity",activity.details,activity.state].filter(Boolean).join(" · ");return `<div class="rich-activity" data-start="${escapeHtml(start||"")}" data-end="${escapeHtml(end||"")}"><span class="rich-activity-name">${escapeHtml(description)}</span>${time?`<span class="rich-activity-time">${escapeHtml(time)}</span>`:""}</div>`}).join("");
    const badgeMarkup=`<div class="badges" aria-label="Discord badges"><img src="https://cdn.discordapp.com/badge-icons/cd5e2cfd9d7f27a8cdcd3e8a8d5dc9f4.png" alt="Nitro" title="Nitro" width="16" height="16"/><img src="https://cdn.discordapp.com/badge-icons/ec92202290b48d0879b7413d2dde3bab.png" alt="Server Booster" title="Server Booster" width="16" height="16"/><img src="https://cdn.discordapp.com/badge-icons/00d6f829e78700d7c57becc6910440a9.png" alt="Gifting" title="Gifting" width="16" height="16"/></div>`;
    card.classList.add("rich-presence-card");
    card.innerHTML=`<div class="avatar-wrap"><img class="avatar" src="${escapeHtml(avatar)}" alt="Discord avatar"/><span class="presence ${escapeHtml(status)}"></span>${decoration?`<img class="avatar-decoration" src="${escapeHtml(decoration)}" alt=""/>`:""}</div><div class="rich-presence-main"><div class="rich-presence-top"><strong class="rich-presence-name">${escapeHtml(user.global_name||user.username||"Draven")}</strong><span class="rich-presence-tag">@${escapeHtml(user.username||"drva")}</span></div><div class="rich-presence-status"><span>${escapeHtml(status)}</span>${devices.length?`<span class="rich-presence-devices" aria-label="Active Discord devices">${devices.map(d=>`<span class="rich-presence-device" title="${d}">${deviceIcon(d)}</span>`).join("")}</span>`:""}</div>${badgeMarkup}<div class="rich-presence-activities">${activityCards||`<div class="rich-presence-empty">no active rich presence</div>`}</div></div><a class="small-action" href="https://discord.com/users/${DISCORD_ID}" target="_blank" rel="noreferrer">discord ↗</a>`;
  };
  const tickTimers=()=>document.querySelectorAll(".rich-activity").forEach(el=>{const time=el.querySelector(".rich-activity-time"),start=el.dataset.start,end=el.dataset.end;if(!time)return;if(start)time.textContent=formatElapsed(Number(start));else if(end)time.textContent=formatRemaining(Number(end));});
  const update=async()=>{const card=document.querySelector(".discord-card");if(!card)return;lastCard=card;try{const response=await fetch(API,{cache:"no-store"});if(!response.ok)throw Error("Lanyard request failed");const json=await response.json();render(card,json.data);}catch(error){if(lastCard&&!lastCard.classList.contains("rich-presence-card"))return;}};
  const boot=()=>{injectStyles();update();const observer=new MutationObserver(()=>{const card=document.querySelector(".discord-card");if(card&&card!==lastCard)update();});observer.observe(document.body,{childList:true,subtree:true});setInterval(update,10000);setInterval(tickTimers,1000);};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
