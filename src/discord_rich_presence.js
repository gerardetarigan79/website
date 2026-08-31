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
      .rich-presence-activities{display:flex;align-items:center;gap:7px;margin-top:7px;min-width:0;overflow:hidden;white-space:nowrap}
      .rich-activity{display:inline-flex;align-items:center;gap:4px;min-width:0;color:#777;font-size:7px;flex:0 1 auto;overflow:hidden;text-overflow:ellipsis}
      .rich-activity+.rich-activity:before{content:"·";color:#3f3f46;margin-right:2px}
      .rich-activity-name{display:block;color:#777;font-size:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px}
      .rich-activity-time{display:inline;color:#555;font-size:7px;flex:0 0 auto}
      .rich-presence-empty{margin-top:6px;color:#555;font-size:8px}
      .rich-presence-card .avatar-wrap{flex:0 0 auto}
      @media(max-width:620px){.rich-presence-card .small-action{display:none}.rich-activity-name{max-width:180px}}
    `;
    document.head.appendChild(style);
  };

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));

  const formatElapsed = (start) => {
    if (!start) return "";
    const seconds = Math.max(0, Math.floor((Date.now() - start) / 1000));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h ? `${h}h ${String(m).padStart(2,"0")}m` : `${m}m ${String(s).padStart(2,"0")}s`;
  };

  const formatRemaining = (end) => {
    if (!end) return "";
    const seconds = Math.max(0, Math.floor((end - Date.now()) / 1000));
    if (!seconds) return "ended";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h ? `ends ${h}h ${String(m).padStart(2,"0")}m` : `ends ${m}m ${String(s).padStart(2,"0")}s`;
  };

  const activityType = (activity) => {
    const types = ["Playing","Streaming","Listening to","Watching","Custom Status","Competing in"];
    return types[activity?.type] || "Activity";
  };

  const deviceIcon = (device) => {
    if (device === "desktop") return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M8 20h8M12 17v3"/></svg>`;
    if (device === "mobile") return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M10 5h4M11 18.5h2"/></svg>`;
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>`;
  };

  const render = (card, data) => {
    if (!card || !data) return;
    injectStyles();
    const user = data.discord_user || {};
    const avatar = user.avatar
      ? `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "png"}?size=128`
      : `https://api.lanyard.rest/${DISCORD_ID}.png`;
    const decoration = user.avatar_decoration_data?.asset
      ? `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=128`
      : "";
    const status = data.discord_status || "offline";
    const devices = [];
    if (data.active_on_discord_desktop) devices.push("desktop");
    if (data.active_on_discord_mobile) devices.push("mobile");
    if (data.active_on_discord_web) devices.push("web");

    // Exclude Spotify (handled by Last.fm) and Discord Custom Status (type 4).
    const activities = (data.activities || []).filter((a) => a && a.name !== "Spotify" && a.type !== 4);
    const activityCards = activities.map((activity) => {
      const start = activity.timestamps?.start;
      const end = activity.timestamps?.end;
      const time = start ? formatElapsed(start) : formatRemaining(end);
      const label = activityType(activity);
      const description = [label, activity.name || "Unknown activity", activity.details, activity.state].filter(Boolean).join(" · ");
      return `<div class="rich-activity" data-start="${escapeHtml(start || "")}" data-end="${escapeHtml(end || "")}"><span class="rich-activity-name">${escapeHtml(description)}</span>${time ? `<span class="rich-activity-time">${escapeHtml(time)}</span>` : ""}</div>`;
    }).join("");

    card.classList.add("rich-presence-card");
    card.innerHTML = `
      <div class="avatar-wrap">
        <img class="avatar" src="${escapeHtml(avatar)}" alt="Discord avatar"/>
        <span class="presence ${escapeHtml(status)}"></span>
        ${decoration ? `<img class="avatar-decoration" src="${escapeHtml(decoration)}" alt=""/>` : ""}
      </div>
      <div class="rich-presence-main">
        <div class="rich-presence-top">
          <strong class="rich-presence-name">${escapeHtml(user.global_name || user.username || "Draven")}</strong>
          <span class="rich-presence-tag">@${escapeHtml(user.username || "drva")}</span>
        </div>
        <div class="rich-presence-status">
          <span>${escapeHtml(status)}</span>
          ${devices.length ? `<span class="rich-presence-devices" aria-label="Active Discord devices">${devices.map((d) => `<span class="rich-presence-device" title="${d}">${deviceIcon(d)}</span>`).join("")}</span>` : ""}
        </div>
        <div class="rich-presence-activities">${activityCards || `<div class="rich-presence-empty">no active rich presence</div>`}</div>
      </div>
      <a class="small-action" href="https://discord.com/users/${DISCORD_ID}" target="_blank" rel="noreferrer">discord ↗</a>
    `;
  };

  const tickTimers = () => {
    document.querySelectorAll(".rich-activity").forEach((el) => {
      const time = el.querySelector(".rich-activity-time");
      if (!time) return;
      const start = el.dataset.start;
      const end = el.dataset.end;
      if (start) time.textContent = formatElapsed(Number(start));
      else if (end) time.textContent = formatRemaining(Number(end));
    });
  };

  const update = async () => {
    const card = document.querySelector(".discord-card");
    if (!card) return;
    lastCard = card;
    try {
      const response = await fetch(API, { cache: "no-store" });
      if (!response.ok) throw new Error("Lanyard request failed");
      const json = await response.json();
      render(card, json.data);
    } catch (error) {
      if (lastCard && !lastCard.classList.contains("rich-presence-card")) return;
    }
  };

  const boot = () => {
    injectStyles();
    update();
    const observer = new MutationObserver(() => {
      const card = document.querySelector(".discord-card");
      if (card && card !== lastCard) update();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setInterval(update, 10000);
    setInterval(tickTimers, 1000);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
