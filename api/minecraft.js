const PLAYER = "iDraven";
const BASE = "https://mc-api.bisai.dev/v1";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
  try {
    const [profileRes, capeRes] = await Promise.all([
      fetch(`${BASE}/profile/${encodeURIComponent(PLAYER)}`),
      fetch(`${BASE}/profile/${encodeURIComponent(PLAYER)}/capes`),
    ]);
    if (!profileRes.ok) throw new Error(`Minecraft profile lookup failed: ${profileRes.status}`);
    const profile = await profileRes.json();
    const capes = capeRes.ok ? await capeRes.json() : [];
    const capeList = Array.isArray(capes) ? capes : capes.capes || capes.items || [];
    const firstSeen = profile.first_seen_at || profile.first_seen || profile.created_at || null;
    const currentCape = profile.cape || profile.current_cape || null;
    const render = profile.renders?.body3d || profile.renders?.fullbody3d || profile.render?.body3d || `${BASE}/render/3d/fullbody/${encodeURIComponent(PLAYER)}`;
    res.status(200).json({
      username: profile.username || PLAYER,
      uuid: profile.uuid || null,
      capes: capeList.length,
      currentCape: currentCape?.url || currentCape?.image || currentCape || null,
      accountAge: firstSeen,
      render,
      source: "mc-api",
    });
  } catch (error) {
    res.status(502).json({ error: "Minecraft profile data unavailable" });
  }
}
