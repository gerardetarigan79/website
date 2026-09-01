const PLAYER = "iDraven";
const BASE = "https://mc-api.bisai.dev/v1";

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  for (const key of ["capes", "items", "data", "results", "entries"]) {
    if (Array.isArray(value[key])) return value[key];
  }
  return [];
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
  try {
    const profileRes = await fetch(`${BASE}/profile/${encodeURIComponent(PLAYER)}`);
    if (!profileRes.ok) throw new Error(`Minecraft profile lookup failed: ${profileRes.status}`);

    const profile = await profileRes.json();

    const [capeRes, namesRes] = await Promise.all([
      fetch(`${BASE}/profile/${encodeURIComponent(PLAYER)}/capes`),
      fetch(`${BASE}/profile/${encodeURIComponent(PLAYER)}/names`),
    ]);

    const capeData = capeRes.ok ? await capeRes.json() : null;
    const nameData = namesRes.ok ? await namesRes.json() : null;

    const profileCapes = toArray(profile?.capes);
    const capeList = toArray(capeData);
    const capes = capeList.length || profileCapes.length || Number(capeData?.total || profile?.cape_count || 0);

    const names = toArray(nameData);
    const oldestName = names[0] || null;
    const accountDate = oldestName?.first_seen
      || oldestName?.first_seen_at
      || oldestName?.created_at
      || profile?.first_seen
      || profile?.first_seen_at
      || profile?.created_at
      || null;

    const currentCape = profile?.cape || profile?.current_cape || profile?.equipped_cape || null;
    const render = profile?.renders?.body3d
      || profile?.renders?.fullbody3d
      || profile?.render?.body3d
      || `${BASE}/render/3d/fullbody/${encodeURIComponent(PLAYER)}`;

    res.status(200).json({
      username: profile?.username || PLAYER,
      uuid: profile?.uuid || null,
      capes,
      currentCape: currentCape?.url || currentCape?.image || currentCape || null,
      accountAge: accountDate,
      edition: "Java",
      render,
      source: "mc-api",
    });
  } catch (error) {
    console.error("Minecraft profile error:", error);
    res.status(502).json({ error: "Minecraft profile data unavailable" });
  }
}
