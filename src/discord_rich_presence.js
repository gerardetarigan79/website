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
      .rich-presence-status{display:flex;align-items:center;gap:5px;margin-top:3px;font-size:8px;color:#666}
      .rich-presence-devices{display:flex;gap:4px;margin-left:2px}
      .rich-presence-device{font-size:7px;color:#777;border:1px solid #29292f;background:#141419;border-radius:4px;padding:2px 4px}
      .rich-presence-activities{display:flex;flex-direction:column;gap:6px;margin-top:8px}
      .rich-activity{display:grid;grid-template-columns:34px minmax(0,1fr);gap:8px;padding:6px 7px;border:1px solid #222229;border-radius:5px;background:rgba(10,10,14,.55);min-width:0}
      .rich-activity-art{width:34px;height:34px;border-radius:5px;object-fit:cover;background:#18181e;border:1px solid #29292f}
      .rich-activity-copy{min-width:0}
      .rich-activity-name{display:block;color:#bbb;font-size:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .rich-activity-details,.rich-activity-state{display:block;color:#666;font-size:7px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .rich-activity-time{display:block;color:#555;font-size:7px;margin-top:3px}
      .rich-activity-link{display:inline-block;margin-top:3px;color:#777;font-size:7px}
      .rich-activity-link:hover{color:#ddd}
      .rich-presence-empty{margin-top:6px;color:#555;font-size:8px}
      .rich-presence-card .avatar-wrap{flex:0 0 auto}
      @media(max-width:620px){.rich-presence-card{align-items:flex-start}.rich-presence-card .small-action{display:none}.rich-activity{grid-template-columns:30px minmax(0,1fr)}.rich-activity-art{width:30px;height:30px}}
    `;
    document.head.appendChild(style);
  };

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));

  const imageUrl = (activity, key) => {
    const asset = activity?.assets?.[key];
    if (!asset) return null;
    if (asset.startsWith("mp:") && activity.application_id) {
      return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${asset.slice(3)}.png?size=128`;
    }
    if (/^https?:\/\//i.test(asset)) return asset;
    return `https://cdn.discordapp.com/app-assets/${activity.application_id || ""}/${asset}.png?size=128`;
  };

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
    return h ? `ends in ${h}h ${String(m).padStart(2,"0")}m` : `ends in ${m}m ${String(s).padStart(2,"0")}s`;
  };

  const activityType = (activity) => {
    const types = ["Playing","Streaming","Listening to","Watching","Custom Status","Competing in"];
    return types[activity?.type] || "Activity";
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
    if (data.active_on_discord_desktop) devices.push("DESKTOP");
    if (data.active_on_discord_mobile) devices.push("MOBILE");
    if (data.active_on_discord_web) devices.push("WEB");

    const activities = (data.activities || []).filter(Boolean);
    const nonSpotify = activities.filter((a) => a.name !== "Spotify");
    const activityCards = nonSpotify.map((activity) => {
      const large = imageUrl(activity, "large_image") || imageUrl(activity, "small_image");
      const start = activity.timestamps?.start;
      const end = activity.timestamps?.end;
      const time = start ? formatElapsed(start) : formatRemaining(end);
      const href = activity.url || (activity.buttons?.[0]?.url || "");
      const label = activityType(activity);
      return `<div class="rich-activity">
        ${large ? `<img class="rich-activity-art" src="${escapeHtml(large)}" alt="" loading="lazy"/>` : `<div class="rich-activity-art"></div>`}
        <div class="rich-activity-copy">
          <span class="rich-activity-name">${escapeHtml(label)} · ${escapeHtml(activity.name || "Unknown activity")}</span>
          ${activity.details ? `<span class="rich-activity-details">${escapeHtml(activity.details)}</span>` : ""}
          ${activity.state ? `<span class="rich-activity-state">${escapeHtml(activity.state)}</span>` : ""}
          ${time ? `<span class="rich-activity-time">${escapeHtml(time)}</span>` : ""}
          ${href ? `<a class="rich-activity-link" href="${escapeHtml(href)}" target="_blank" rel="noreferrer">open activity ↗</a>` : ""}
        </div>
      </div>`;
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
          ${devices.length ? `<span class="rich-presence-devices">${devices.map((d) => `<span class="rich-presence-device">${d}</span>`).join("")}</span>` : ""}
        </div>
        <div class="rich-presence-activities">
          ${activityCards || `<div class="rich-presence-empty">no active rich presence</div>`}
        </div>
      </div>
      <a class="small-action" href="https://discord.com/users/${DISCORD_ID}" target="_blank" rel="noreferrer">discord ↗</a>
    `;
  };

  const tickTimers = () => {
    document.querySelectorAll(".rich-activity").forEach((el) => {
      const time = el.querySelector(".rich-activity-time");
      if (!time) return;
      const marker = el.dataset.start;
      const endMarker = el.dataset.end;
      if (marker) time.textContent = formatElapsed(Number(marker));
      else if (endMarker) time.textContent = formatRemaining(Number(endMarker));
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
      document.querySelectorAll(".rich-activity").forEach((el, index) => {
        const activity = (json.data?.activities || []).filter((a) => a.name !== "Spotify")[index];
        if (activity?.timestamps?.start) el.dataset.start = activity.timestamps.start;
        if (activity?.timestamps?.end) el.dataset.end = activity.timestamps.end;
      });
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
