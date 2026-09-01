const PLAYER = "iDraven";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
  const key = process.env.HYPIXEL_API_KEY;
  if (!key) return res.status(503).json({ error: "HYPIXEL_API_KEY is not configured" });
  try {
    const r = await fetch(`https://api.hypixel.net/v2/player?name=${encodeURIComponent(PLAYER)}`, {
      headers: { "API-Key": key },
    });
    const data = await r.json();
    if (!r.ok || data.success === false || !data.player) throw new Error("Hypixel player unavailable");
    const bw = data.player.stats?.Bedwars || {};
    const games = Number(bw.games_played_bedwars || 0);
    const wins = Number(bw.wins_bedwars || 0);
    const losses = Number(bw.losses_bedwars || 0);
    const kills = Number(bw.kills_bedwars || 0);
    const deaths = Number(bw.deaths_bedwars || 0);
    const bedsBroken = Number(bw.beds_broken_bedwars || 0);
    const bedsLost = Number(bw.beds_lost_bedwars || 0);
    res.status(200).json({
      level: Number(data.player.achievements?.bedwars_level || 0),
      wins,
      losses,
      wlr: losses ? +(wins / losses).toFixed(2) : wins,
      kills,
      deaths,
      kdr: deaths ? +(kills / deaths).toFixed(2) : kills,
      bedsBroken,
      bedsLost,
      bblr: bedsLost ? +(bedsBroken / bedsLost).toFixed(2) : bedsBroken,
      games,
    });
  } catch (error) {
    res.status(502).json({ error: "Hypixel BedWars data unavailable" });
  }
}
