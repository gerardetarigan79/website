const PLAYER = "iDraven";
const BASE = "https://mc-api.bisai.dev/v1";

function arrayFrom(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.capes)) return value.capes;
  if (value && Array.isArray(value.data)) return value.data;
  if (value && Array.isArray(value.items)) return value.items;
  return [];
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");

  try {
    // Keep this route to one API request. The profile endpoint already includes
    // the player's skin, cape list, UUID, and ready-to-use render URLs.
    const response = await fetch(`${BASE}/profile/${encodeURIComponent(PLAYER)}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`mc-api profile ${response.status}${detail ? `: ${detail.slice(0, 160)}` : ""}`);
    }

    const profile = await response.json();
    const capes = arrayFrom(profile?.capes);

    const uniqueCapes = new Set(
      capes.map((cape) =>
        cape?.texture_key || cape?.textureKey || cape?.url || cape?.image || cape?.id
      ).filter(Boolean)
    );

    const render =
      profile?.renders?.body3d ||
      profile?.renders?.fullbody3d ||
      profile?.renders?.render3d ||
      profile?.render?.body3d ||
      `${BASE}/render/3d/fullbody/${encodeURIComponent(PLAYER)}`;

    const currentCape =
      profile?.cape?.url ||
      profile?.cape?.image ||
      profile?.current_cape?.url ||
      profile?.current_cape?.image ||
      profile?.equipped_cape?.url ||
      profile?.equipped_cape?.image ||
      null;

    res.status(200).json({
      username: profile?.username || PLAYER,
      uuid: profile?.uuid || null,
      capes: uniqueCapes.size,
      currentCape,
      // mc-api does not expose the actual Mojang/Microsoft account creation date.
      // Keep this null rather than displaying a fabricated date.
      firstSeen: null,
      edition: "Java",
      render,
      source: "mc-api",
    });
  } catch (error) {
    console.error("Minecraft profile error:", error);
    res.status(502).json({ error: "Minecraft profile data unavailable" });
  }
}
