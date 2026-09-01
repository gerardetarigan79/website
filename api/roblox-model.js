const USER_ID = "331953010";

export default async function handler(req, res) {
  if (req.method && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ROBLOX_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ROBLOX_API_KEY is not configured" });

  try {
    const metaResponse = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-3d?userId=${USER_ID}&useGltf=true`,
      {
        headers: { "x-api-key": apiKey },
        signal: AbortSignal.timeout(10000),
      },
    );

    if (!metaResponse.ok) {
      return res.status(metaResponse.status).json({ error: `Roblox avatar-3d returned ${metaResponse.status}` });
    }

    const meta = await metaResponse.json();
    const modelUrl = meta?.imageUrl;
    if (!modelUrl) return res.status(502).json({ error: `Roblox avatar-3d returned no model URL (${meta?.state || "unknown"})` });

    const modelResponse = await fetch(modelUrl, { signal: AbortSignal.timeout(15000) });
    if (!modelResponse.ok) return res.status(modelResponse.status).json({ error: `Roblox model asset returned ${modelResponse.status}` });

    const contentType = modelResponse.headers.get("content-type") || "model/gltf-binary";
    const buffer = Buffer.from(await modelResponse.arrayBuffer());
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).send(buffer);
  } catch (error) {
    return res.status(502).json({ error: error?.message || "Unable to load Roblox 3D avatar" });
  }
}
