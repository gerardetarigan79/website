const USER_ID = "331953010";

async function getJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: options.signal || AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    const error = new Error(`Roblox returned ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

async function safe(label, task) {
  try {
    return { ok: true, value: await task() };
  } catch (error) {
    return { ok: false, error: `${label}: ${error.message || "request failed"}`, status: error.status || null };
  }
}

async function countBadges() {
  let cursor = "";
  let total = 0;
  for (let pageNumber = 0; pageNumber < 25; pageNumber += 1) {
    const query = new URLSearchParams({ limit: "100", sortOrder: "Desc" });
    if (cursor) query.set("cursor", cursor);
    const page = await getJson(`https://badges.roblox.com/v1/users/${USER_ID}/badges?${query}`, {
      signal: AbortSignal.timeout(5000),
    });
    total += page?.data?.length || 0;
    cursor = page?.nextPageCursor || "";
    if (!cursor) return total;
  }
  return total;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ROBLOX_API_KEY || "";

  const [userR, friendsR, followersR, badgesR, presenceR, lastOnlineR, avatarR] = await Promise.all([
    safe("profile", () => getJson(`https://users.roblox.com/v1/users/${USER_ID}`)),
    safe("friends", () => getJson(`https://friends.roblox.com/v1/users/${USER_ID}/friends/count`)),
    safe("followers", () => getJson(`https://friends.roblox.com/v1/users/${USER_ID}/followers/count`)),
    safe("badges", () => countBadges()),
    safe("presence", () => getJson("https://presence.roblox.com/v1/presence/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: [Number(USER_ID)] }),
    })),
    safe("last online", () => getJson(`https://presence.roblox.com/v1/presence/last-online`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: [Number(USER_ID)] }),
    })),
    safe("avatar", () => getJson(
      `https://thumbnails.roblox.com/v1/users/avatar?userIds=${USER_ID}&size=420x420&format=Png&isCircular=false`,
    )),
  ]);

  const diagnostics = {
    profile: userR.ok ? "ok" : userR.error,
    friends: friendsR.ok ? "ok" : friendsR.error,
    followers: followersR.ok ? "ok" : followersR.error,
    badges: badgesR.ok ? "ok" : badgesR.error,
    presence: presenceR.ok ? "ok" : presenceR.error,
    lastOnline: lastOnlineR.ok ? "ok" : lastOnlineR.error,
    avatar: avatarR.ok ? "ok" : avatarR.error,
    threeD: apiKey ? "checking" : "missing ROBLOX_API_KEY",
  };

  let modelUrl = "";
  let modelState = "unavailable";
  if (apiKey) {
    const modelR = await safe("3d avatar", () => getJson(
      `https://thumbnails.roblox.com/v1/users/avatar-3d?userId=${USER_ID}&useGltf=true`,
      { headers: { "x-api-key": apiKey } },
    ));
    if (modelR.ok) {
      modelUrl = modelR.value?.imageUrl || "";
      modelState = modelR.value?.state || "unknown";
      diagnostics.threeD = modelUrl ? `ok (${modelState})` : `no model URL (${modelState})`;
    } else {
      diagnostics.threeD = modelR.error;
    }
  }

  const user = userR.ok ? userR.value : null;
  const p = presenceR.ok ? presenceR.value?.userPresences?.[0] || {} : {};
  const lastOnline = lastOnlineR.ok
    ? lastOnlineR.value?.lastOnlineTimestamps?.[0]?.lastOnline || lastOnlineR.value?.lastOnline || null
    : null;
  const avatarUrl = avatarR.ok ? avatarR.value?.data?.[0]?.imageUrl || "" : "";

  let game = null;
  if (p.universeId) {
    const gameR = await safe("game", () => getJson(`https://games.roblox.com/v1/games?universeIds=${p.universeId}`));
    if (gameR.ok) {
      const g = gameR.value?.data?.[0];
      if (g) game = { name: g.name || "Roblox", rootPlaceId: g.rootPlaceId || p.placeId || null, universeId: p.universeId };
    }
    diagnostics.game = game ? "ok" : "game info unavailable";
  }

  const badgeCount = badgesR.ok && badgesR.value > 0 ? badgesR.value : null;
  const badgeStatus = badgesR.ok && badgesR.value === 0 ? "unavailable" : badgesR.ok ? "ok" : "unavailable";

  return res.status(200).json({
    user: user ? { id: user.id, username: user.name, displayName: user.displayName, created: user.created } : null,
    avatarUrl,
    modelUrl,
    modelState,
    friends: friendsR.ok ? friendsR.value?.count ?? null : null,
    followers: followersR.ok ? followersR.value?.count ?? null : null,
    badges: badgeCount,
    badgeStatus,
    presence: {
      type: p.userPresenceType ?? 0,
      lastLocation: p.lastLocation || "",
      lastOnline,
      placeId: p.placeId || null,
      universeId: p.universeId || null,
      game,
    },
    diagnostics,
    fetchedAt: new Date().toISOString(),
  });
}
