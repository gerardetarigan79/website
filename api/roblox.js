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

function cdnUrl(hash) {
  if (!hash) return "";
  let i = 31;
  for (let t = 0; t < Math.min(38, hash.length); t += 1) i ^= hash[t].charCodeAt(0);
  return `https://t${((i % 8) + 8) % 8}.rbxcdn.com/${hash}`;
}

async function getAvatar3D(apiKey) {
  const thumbnail = await getJson(`https://thumbnails.roblox.com/v1/users/avatar-3d?userId=${USER_ID}`, {
    headers: { "x-api-key": apiKey },
  });
  const item = thumbnail?.data?.[0] || thumbnail;
  if (!item?.imageUrl || item?.state !== "Completed") throw new Error(`avatar thumbnail state: ${item?.state || "unavailable"}`);
  const descriptor = await getJson(item.imageUrl);
  return {
    descriptorUrl: item.imageUrl,
    objUrl: cdnUrl(descriptor.obj),
    mtlUrl: cdnUrl(descriptor.mtl),
    textureUrls: Array.isArray(descriptor.textures) ? descriptor.textures.map(cdnUrl) : [],
    aabb: descriptor.aabb || null,
    camera: descriptor.camera || null,
  };
}

async function countInventoryBadges(apiKey) {
  let pageToken = "";
  let total = 0;
  for (let pageNumber = 0; pageNumber < 100; pageNumber += 1) {
    const params = new URLSearchParams({ maxPageSize: "100", filter: "badges=true" });
    if (pageToken) params.set("pageToken", pageToken);
    const page = await getJson(`https://apis.roblox.com/cloud/v2/users/${USER_ID}/inventory-items?${params.toString()}`, { headers: { "x-api-key": apiKey } });
    total += Array.isArray(page?.inventoryItems) ? page.inventoryItems.length : 0;
    pageToken = page?.nextPageToken || "";
    if (!pageToken || !page?.inventoryItems?.length) return total;
  }
  return total;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method && req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ROBLOX_API_KEY || "";

  const [userR, friendsR, followersR, presenceR, avatarR] = await Promise.all([
    safe("profile", () => getJson(`https://users.roblox.com/v1/users/${USER_ID}`)),
    safe("friends", () => getJson(`https://friends.roblox.com/v1/users/${USER_ID}/friends/count`)),
    safe("followers", () => getJson(`https://friends.roblox.com/v1/users/${USER_ID}/followers/count`)),
    safe("presence", () => getJson("https://presence.roblox.com/v1/presence/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: [Number(USER_ID)] }),
    })),
    safe("avatar", () => getJson(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${USER_ID}&size=420x420&format=Png&isCircular=false`)),
  ]);

  const p = presenceR.ok ? presenceR.value?.userPresences?.[0] || {} : {};
  const isOffline = (p.userPresenceType ?? 0) === 0;

  // Roblox documents this endpoint as the accurate source for last-online timestamps.
  // Include the Open Cloud key when available; this also makes the request work in
  // environments where Roblox requires authenticated presence access.
  const lastOnlineR = await safe("last online", () => getJson("https://presence.roblox.com/v1/presence/last-online", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "x-api-key": apiKey } : {}),
    },
    body: JSON.stringify({ userIds: [Number(USER_ID)] }),
  }));

  const diagnostics = {
    profile: userR.ok ? "ok" : userR.error,
    friends: friendsR.ok ? "ok" : friendsR.error,
    followers: followersR.ok ? "ok" : followersR.error,
    presence: presenceR.ok ? "ok" : presenceR.error,
    lastOnline: lastOnlineR.ok ? "ok" : lastOnlineR.error,
    avatar: avatarR.ok ? "ok" : avatarR.error,
    threeD: apiKey ? "checking" : "missing ROBLOX_API_KEY",
    badges: apiKey ? "checking" : "missing ROBLOX_API_KEY",
  };

  let model = null;
  if (apiKey) {
    const modelR = await safe("3d avatar", () => getAvatar3D(apiKey));
    if (modelR.ok) {
      model = modelR.value;
      diagnostics.threeD = "ok";
    } else diagnostics.threeD = modelR.error;
  }

  let badges = null;
  if (apiKey) {
    const badgeR = await safe("inventory badges", () => countInventoryBadges(apiKey));
    if (badgeR.ok) {
      badges = badgeR.value;
      diagnostics.badges = "ok";
    } else diagnostics.badges = badgeR.error;
  }

  const user = userR.ok ? userR.value : null;
  const timestamps = lastOnlineR.ok ? lastOnlineR.value?.lastOnlineTimestamps : null;
  const lastOnline = Array.isArray(timestamps) ? (timestamps.find((item) => Number(item?.userId) === Number(USER_ID))?.lastOnline || timestamps[0]?.lastOnline || null) : null;
  const avatarUrl = avatarR.ok ? avatarR.value?.data?.[0]?.imageUrl || "" : "";

  let game = null;
  if (p.universeId && (p.userPresenceType === 2 || p.userPresenceType === 3)) {
    const gameR = await safe("game", () => getJson(`https://games.roblox.com/v1/games?universeIds=${p.universeId}`));
    if (gameR.ok) {
      const g = gameR.value?.data?.[0];
      if (g) game = { name: g.name || "Roblox", rootPlaceId: g.rootPlaceId || p.placeId || null, universeId: p.universeId };
    }
    diagnostics.game = game ? "ok" : "game info unavailable";
  }

  return res.status(200).json({
    user: user ? { id: user.id, username: user.name, displayName: user.displayName, created: user.created } : null,
    avatarUrl,
    model,
    friends: friendsR.ok ? friendsR.value?.count ?? null : null,
    followers: followersR.ok ? followersR.value?.count ?? null : null,
    badges,
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
