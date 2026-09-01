const PLAYER = "iDraven";
const BASE = "https://mc-api.bisai.dev/v1";

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  for (const key of ["capes", "names", "items", "data", "results", "entries", "history"]) {
    if (Array.isArray(value[key])) return value[key];
  }
  return Object.values(value).flatMap((item) => Array.isArray(item) ? item : []);
}

function findArrays(value, predicate, seen = new Set()) {
  if (!value || typeof value !== "object" || seen.has(value)) return [];
  seen.add(value);
  const found = [];
  if (Array.isArray(value)) {
    if (value.some(predicate)) found.push(value);
    for (const item of value) found.push(...findArrays(item, predicate, seen));
  } else {
    for (const item of Object.values(value)) found.push(...findArrays(item, predicate, seen));
  }
  return found;
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "") ?? null;
}

function findDate(value, seen = new Set()) {
  if (!value || typeof value !== "object" || seen.has(value)) return null;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      const result = findDate(item, seen);
      if (result) return result;
    }
    return null;
  }

  const preferredKeys = [
    "first_seen_at", "first_seen", "firstSeenAt", "firstSeen",
    "first_observed_at", "first_observed", "firstObservedAt", "firstObserved",
    "started_at", "startedAt", "created_at", "createdAt", "observed_at", "observedAt"
  ];
  for (const key of preferredKeys) {
    const valueForKey = value[key];
    if (typeof valueForKey === "string" && !Number.isNaN(Date.parse(valueForKey))) return valueForKey;
  }

  for (const child of Object.values(value)) {
    const result = findDate(child, seen);
    if (result) return result;
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");

  try {
    const profileUrl = `${BASE}/profile/${encodeURIComponent(PLAYER)}`;
    const [profileRes, capeRes, namesRes, rarityRes, equippedCapeRes] = await Promise.all([
      fetch(profileUrl),
      fetch(`${profileUrl}/capes`),
      fetch(`${profileUrl}/names`),
      fetch(`${profileUrl}/rarity`),
      fetch(`${BASE}/cape/${encodeURIComponent(PLAYER)}/mojang`),
    ]);

    if (!profileRes.ok) throw new Error(`Minecraft profile lookup failed: ${profileRes.status}`);

    const profile = await profileRes.json();
    const capeData = capeRes.ok ? await capeRes.json() : null;
    const nameData = namesRes.ok ? await namesRes.json() : null;
    const rarityData = rarityRes.ok ? await rarityRes.json() : null;

    // The cape endpoint may be an array, an object containing an array, or an
    // object keyed by cape texture. Count unique texture keys/URLs defensively.
    const capeCandidates = [
      ...toArray(capeData),
      ...toArray(profile?.capes),
      ...findArrays(profile, (item) => item && typeof item === "object" && (item.texture_key || item.textureKey || item.url)),
    ].flat();

    const uniqueCapes = new Set(
      capeCandidates
        .filter((cape) => cape && typeof cape === "object")
        .map((cape) => cape.texture_key || cape.textureKey || cape.url || cape.image)
        .filter(Boolean)
    );

    const rarityOwned = Number(firstValue(
      rarityData?.owned,
      rarityData?.owned_capes,
      rarityData?.ownedCapes,
      rarityData?.collection?.owned,
      rarityData?.summary?.owned,
    ));

    // If the documented equipped-cape endpoint responds successfully with an
    // image, there is at least one currently equipped Mojang cape even if the
    // observed collection endpoint has not indexed it yet.
    const hasEquippedCape = equippedCapeRes.ok &&
      (equippedCapeRes.headers.get("content-type") || "").includes("image");

    const capeCount = Math.max(
      uniqueCapes.size,
      Number.isFinite(rarityOwned) ? rarityOwned : 0,
      hasEquippedCape ? 1 : 0,
    );

    const names = toArray(nameData);
    const oldestName = names[0] || null;
    const firstSeen = findDate(oldestName) || findDate(nameData) || findDate(profile);

    const currentCape = hasEquippedCape
      ? `${BASE}/cape/${encodeURIComponent(PLAYER)}/mojang`
      : firstValue(
          profile?.cape?.url,
          profile?.cape?.image,
          profile?.current_cape?.url,
          profile?.current_cape?.image,
          profile?.equipped_cape?.url,
          profile?.equipped_cape?.image,
        );

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
      currentCape: currentCape || null,
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
