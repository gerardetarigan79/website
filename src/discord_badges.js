const DISCORD_BADGE_ICONS = [
  {
    src: "https://cdn.discordapp.com/badge-icons/cd5e2cfd9d7f27a8cdcd3e8a8d5dc9f4.png",
    title: "Nitro"
  },
  {
    src: "https://cdn.discordapp.com/badge-icons/ec92202290b48d0879b7413d2dde3bab.png",
    title: "Server Booster"
  },
  {
    src: "https://cdn.discordapp.com/badge-icons/00d6f829e78700d7c57becc6910440a9.png",
    title: "Gifting"
  }
];

function renderDiscordBadges() {
  const badges = document.querySelector(".discord-card .badges");
  if (!badges || badges.dataset.customDiscordBadges === "true") return;

  badges.dataset.customDiscordBadges = "true";
  badges.replaceChildren(
    ...DISCORD_BADGE_ICONS.map(({src, title}) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = title;
      img.title = title;
      img.width = 22;
      img.height = 22;
      img.loading = "eager";
      img.decoding = "async";
      img.style.width = "22px";
      img.style.height = "22px";
      img.style.objectFit = "contain";
      img.style.display = "block";
      return img;
    })
  );
}

const observer = new MutationObserver(renderDiscordBadges);
observer.observe(document.getElementById("root") || document.body, {childList: true, subtree: true});
renderDiscordBadges();
