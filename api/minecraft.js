const PLAYER = "iDraven";
const BASE = "https://mc-api.bisai.dev/v1";

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  for (const key of ["capes", "names", "items", "data", "results", "entries"]) {
    if (Array.isArray(value[key])) return value[key];
    if (value[key] && typeof value[key] === "object") {
      const nested = asArray(value[key]);
      if (nested.length) return nested;
    }
  }
  return [];
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "") ?? null;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");

  try {
    const profileUrl = `${BASE}/profile/${encodeURIComponent(PLAYER)}`;
    const profileRes = await fetch(profileUrl);
    if (!profileRes.ok) throw new Error(`Minecraft profile lookup failed: ${profileRes.status}`);

    const profile = await profileRes.json();

    const [capeRes, namesRes, rarityRes] = await Promise.all([
      fetch(`${profileUrl}/capes`),
      fetch(`${profileUrl}/names`),
      fetch(`${profileUrl}/rarity`),
    ]);

    const capeData = capeRes.ok ? await capeRes.json() : null;
    const nameData = namesRes.ok ? await namesRes.json() : null;
    const rarityData = rarityRes.ok ? await rarityRes.json() : null;

    // /profile/{id}/capes is the authoritative observed cape collection.
    const profileCapes = asArray(profile?.capes);
    const endpointCapes = asArray(capeData);
    const rarityOwned = firstValue(
      rarityData?.owned,
      rarityData?.owned_capes,
      rarityData?.ownedCapes,
      rarityData?.collection?.owned,
    );

    const capeCount = endpointCapes.length || profileCapes.length ||
      (Number.isFinite(Number(rarityOwned)) ? Number(rarityOwned) : 0);

    const names = asArray(nameData);
    const oldestName = names[0] || null;

    // The API does not expose Mojang/Microsoft account creation time. When it
    // has an observation timestamp available, expose it as "First Seen" instead.
    const firstSeen = firstValue(
      oldestName?.first_seen_at,
      oldestName?.first_seen,
      oldestName?.created_at,
      profile?.first_seen_at,
      profile?.first_seen,
    );

    let currentCape = firstValue(
      profile?.cape?.url,
      profile?.cape?.image,
      profile?.current_cape?.url,
      profile?.current_cape?.image,
      profile?.equipped_cape?.url,
      profile?.equipped_cape?.image,
    );

    // Keep the equipped cape available even when the profile object doesn't
    // inline its URL. The documented endpoint returns the current cape image.
    if (!currentCape) {
      currentCape = `${BASE}/cape/${encodeURIComponent(PLAYER)}/mojang`;
    }

    const render = firstValue(
      profile?.renders?.body3d,
      profile?.renders?.fullbody3d,
      profile?.render?.body3d,
      `${BASE}/render/3d/fullbody/${encodeURIComponent(PLAYER)}`,
    );

    res.status(200).json({
      username: profile?.username || PLAYER,
      uuid: profile?.uuid || null,
      capes: capeCount,
      currentCape,
      firstSeen,
      edition: "Java",
      render,
      source: "mc-api",
    });
  } catch (error) {
    console.error("Minecraft profile error:", error);
    res.status(502).json({ error: "Minecraft profile data unavailable" });
  }
}
