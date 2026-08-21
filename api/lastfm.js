export default async function handler(req,res){
  const key=process.env.LASTFM_API_KEY;
  const user=process.env.LASTFM_USER||"drva7";
  if(!key)return res.status(500).json({error:"LASTFM_API_KEY is not configured"});
  const type=req.query?.type||"recent";
  const methods={recent:"user.getrecenttracks",artists:"user.gettopartists",albums:"user.gettopalbums",info:"user.getinfo"};
  const method=methods[type]||methods.recent;
  const params=new URLSearchParams({method,user,api_key:key,format:"json",limit:type==="recent"?"20":"12",period:"1month"});
  try{
    const r=await fetch(`https://ws.audioscrobbler.com/2.0/?${params}`);
    const data=await r.json();
    if(!r.ok || data?.error) return res.status(502).json(data);

    // Last.fm sometimes returns empty artist images from user.gettopartists.
    // Enrich the small visible artist list with artist.getinfo when needed.
    if(type === "artists"){
      const artists=data?.topartists?.artist || [];
      const enriched=await Promise.all(artists.slice(0,8).map(async artist=>{
        try{
          const p=new URLSearchParams({method:"artist.getinfo",artist:artist.name,api_key:key,format:"json"});
          const rr=await fetch(`https://ws.audioscrobbler.com/2.0/?${p}`);
          const dd=await rr.json();
          return {...artist,image:dd?.artist?.image || artist.image || []};
        }catch{return artist;}
      }));
      data.topartists={...(data.topartists||{}),artist:enriched.concat(artists.slice(8))};
    }
    return res.status(200).json(data);
  }catch(e){return res.status(500).json({error:e.message})}
}
