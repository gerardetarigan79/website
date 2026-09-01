const PLAYER = "iDraven";
const BASE = "https://mc-api.bisai.dev/v1";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");

  const result = {
    username: PLAYER,
    uuid: null,
    capes: 0,
    currentCape: null,
    firstSeen: null,
    edition: "Java",
    render: `${BASE}/render/3d/fullbody/${encodeURIComponent(PLAYER)}`,
    source: "mc-api",
  };

  try {
    const response = await fetch(`${BASE}/profile/${encodeURIComponent(PLAYER)}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error(`mc-api profile returned ${response.status}`);
      return res.status(200).json(result);
    }

    const profile = await response.json();

    result.username = profile?.username || profile?.name || PLAYER;
    result.uuid = profile?.uuid || profile?.id || null;

    // The API has returned cape data in different shapes over time.
    const rawCapes = profile?.capes ?? profile?.data?.capes ?? profile?.profile?.capes;
    const capes = Array.isArray(rawCapes)
      ? rawCapes
      : rawCapes && typeof rawCapes === "object"
        ? Object.values(rawCapes)
        : [];

    result.capes = capes.filter(Boolean).length;

    const cape = profile?.cape || profile?.currentCape || profile?.current_cape || profile?.equippedCape;
    if (typeof cape === "string") result.currentCape = cape;
    else if (cape && typeof cape === "object") {
      result.currentCape = cape.url || cape.image || cape.texture || cape.textureUrl || null;
    }

    result.render =
      profile?.renders?.body3d ||
      profile?.renders?.fullbody3d ||
      profile?.renders?.render3d ||
      result.render;

    // If the API exposes a profile/name timestamp, use it; otherwise leave it null.
    const timestamps = [
      profile?.firstSeen,
      profile?.first_seen,
      profile?.createdAt,
      profile?.created_at,
      profile?.timestamps?.created,
    ].filter((value) => value != null);

    if (timestamps.length) result.firstSeen = timestamps[0];

    return res.status(200).json(result);
  } catch (error) {
    // Never turn an upstream Minecraft API problem into a 502 for the website.
    // Return usable defaults so the Minecraft card can still render.
    console.error("Minecraft profile fetch failed:", error?.message || error);
    return res.status(200).json(result);
  }
}
