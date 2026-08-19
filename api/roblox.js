export default async function handler(req,res){
  const userId = "331953010";
  try {
    const r = await fetch(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
    if(!r.ok) return res.status(502).json({error:`Roblox returned ${r.status}`});
    const data = await r.json();
    const imageUrl = data?.data?.[0]?.imageUrl;
    if(!imageUrl) return res.status(404).json({error:"Roblox avatar image unavailable"});
    return res.status(200).json({imageUrl});
  } catch(e){ return res.status(502).json({error:e.message}); }
}
