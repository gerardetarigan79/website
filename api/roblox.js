const USER_ID = "331953010";

async function getJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Roblox returned ${response.status}`);
  return response.json();
}

export default async function handler(req, res) {
  try {
    const apiKey = process.env.ROBLOX_API_KEY || "";

    const [user, friends, followers, following, badges, presence] = await Promise.all([
      getJson(`https://users.roblox.com/v1/users/${USER_ID}`),
      getJson(`https://friends.roblox.com/v1/users/${USER_ID}/friends/count`),
      getJson(`https://friends.roblox.com/v1/users/${USER_ID}/followers/count`),
      getJson(`https://friends.roblox.com/v1/users/${USER_ID}/followings/count`),
      getJson(`https://badges.roblox.com/v1/users/${USER_ID}/badges?limit=10&sortOrder=Desc`),
      getJson("https://presence.roblox.com/v1/presence/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: [Number(USER_ID)] }),
      }),
    ]);

    let modelUrl = "";
    let modelState = "unavailable";
    if (apiKey) {
      try {
        const model = await getJson(
          `https://thumbnails.roblox.com/v1/users/avatar-3d?userId=${USER_ID}&useGltf=true`,
          { headers: { "x-api-key": apiKey } },
        );
        modelUrl = model?.imageUrl || "";
        modelState = model?.state || "unavailable";
      } catch (_) {
        modelState = "error";
      }
    }

    const avatar = await getJson(
      `https://thumbnails.roblox.com/v1/users/avatar?userIds=${USER_ID}&size=420x420&format=Png&isCircular=false`,
    );
    const imageUrl = avatar?.data?.[0]?.imageUrl || "";
    const p = presence?.userPresences?.[0] || {};

    return res.status(200).json({
      user: { id: user.id, username: user.name, displayName: user.displayName, created: user.created },
      avatarUrl: imageUrl,
      modelUrl,
      modelState,
      friends: friends.count || 0,
      followers: followers.count || 0,
      following: following.count || 0,
      badges: badges.total || badges.data?.length || 0,
      presence: {
        type: p.userPresenceType ?? 0,
        lastLocation: p.lastLocation || "",
        lastOnline: p.lastOnline || null,
        placeId: p.placeId || null,
        universeId: p.universeId || null,
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (e) {
    return res.status(502).json({ error: e.message || "Roblox unavailable" });
  }
}
