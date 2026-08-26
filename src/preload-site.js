// Warm the main site's API/data requests while the entry screen is still visible.
// The actual React UI remains behind the intro until the user enters.
(() => {
  const urls = [
    "/api/lastfm?type=recent",
    "/api/lastfm?type=artists",
    "/api/lastfm?type=albums",
    "/api/lastfm?type=info",
    "/api/steam",
    "/api/roblox",
    "/api/f1",
    "https://api.lanyard.rest/v1/users/715076381293150288",
    "https://api.open-meteo.com/v1/forecast?latitude=-7.2575&longitude=112.7521&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia%2FJakarta"
  ];

  const warm = (url) => {
    try {
      fetch(url, { credentials: "same-origin", cache: "no-store" }).catch(() => {});
    } catch (_) {}
  };

  // Let the intro get first paint priority, then start warming the site.
  const start = () => urls.forEach((url, i) => setTimeout(() => warm(url), i * 45));

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(start, { timeout: 250 });
  } else {
    window.setTimeout(start, 120);
  }
})();
