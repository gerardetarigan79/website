export default function handler(req, res) {
  return res.status(410).json({ error: "Roblox activity tracking has been removed" });
}
