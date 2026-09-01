import { neon } from "@neondatabase/serverless";

const USER_ID = "331953010";

async function getJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: options.signal || AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Roblox returned ${response.status}`);
  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.ROBLOX_TRACK_SECRET;
  const supplied = req.headers.authorization?.replace(/^Bearer\s+/i, "") || req.query?.secret;
  if (!secret || supplied !== secret) return res.status(401).json({ error: "Unauthorized" });

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
  if (!connectionString) return res.status(500).json({ error: "Database connection is not configured" });

  const apiKey = process.env.ROBLOX_API_KEY || "";
  const sql = neon(connectionString);

  try {
    const presenceResponse = await getJson("https://presence.roblox.com/v1/presence/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: [Number(USER_ID)] }),
    });
    const presence = presenceResponse?.userPresences?.[0] || {};
    const type = presence.userPresenceType ?? 0;
    const online = type === 1 || type === 2 || type === 3;
    const playing = type === 2 && presence.universeId;

    const existingRows = await sql`SELECT * FROM public.roblox_activity WHERE user_id = ${Number(USER_ID)} LIMIT 1`;
    const existing = existingRows[0] || null;

    let game = null;
    if (playing) {
      const gameResponse = await getJson(`https://games.roblox.com/v1/games?universeIds=${presence.universeId}`);
      const item = gameResponse?.data?.[0];
      if (item) game = { name: item.name || "Roblox", universeId: presence.universeId, rootPlaceId: item.rootPlaceId || presence.placeId || null };
    }

    let lastOnline = null;
    try {
      const response = await getJson("https://presence.roblox.com/v1/presence/last-online", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-api-key": apiKey } : {}),
        },
        body: JSON.stringify({ userIds: [Number(USER_ID)] }),
      });
      const item = response?.lastOnlineTimestamps?.find((entry) => Number(entry?.userId) === Number(USER_ID));
      lastOnline = item?.lastOnline || null;
    } catch (_) {}

    const now = new Date();
    const lastPlayedAt = playing && game
      ? (!existing?.last_game_id || String(existing.last_game_id) !== String(game.universeId) ? now : existing.last_played_at)
      : existing?.last_played_at || null;
    const lastGameId = playing && game ? game.universeId : existing?.last_game_id || null;
    const lastGameName = playing && game ? game.name : existing?.last_game_name || null;
    const lastSeenAt = online ? now : (existing?.last_seen_at || lastOnline || null);

    await sql`
      INSERT INTO public.roblox_activity (user_id, last_game_id, last_game_name, last_played_at, last_seen_at, updated_at)
      VALUES (${Number(USER_ID)}, ${lastGameId}, ${lastGameName}, ${lastPlayedAt}, ${lastSeenAt}, now())
      ON CONFLICT (user_id) DO UPDATE SET
        last_game_id = EXCLUDED.last_game_id,
        last_game_name = EXCLUDED.last_game_name,
        last_played_at = EXCLUDED.last_played_at,
        last_seen_at = EXCLUDED.last_seen_at,
        updated_at = now();
    `;

    return res.status(200).json({ ok: true, online, playing: Boolean(playing), game, lastPlayedAt, lastSeenAt });
  } catch (error) {
    console.error("Roblox tracker error:", error);
    return res.status(500).json({ error: "Unable to update Roblox activity" });
  }
}
