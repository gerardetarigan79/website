const CACHE_TTL=30_000;
const cache=new Map();
const inflight=new Map();

export default async function handler(req,res){
  const key=process.env.LASTFM_API_KEY;
  const user=process.env.LASTFM_USER||"drva7";
  if(!key)return res.status(500).json({error:"LASTFM_API_KEY is not configured"});

  const type=req.query?.type||"recent";
  const methods={recent:"user.getrecenttracks",artists:"user.gettopartists",albums:"user.gettopalbums",info:"user.getinfo"};
  const method=methods[type]||methods.recent;
  const cacheKey=`${user}:${type}`;
  const cached=cache.get(cacheKey);
  if(cached&&Date.now()-cached.time<CACHE_TTL){
    res.setHeader("Cache-Control","public, s-maxage=30, stale-while-revalidate=60");
    return res.status(200).json(cached.data);
  }

  if(inflight.has(cacheKey)){
    try{
      const data=await inflight.get(cacheKey);
      res.setHeader("Cache-Control","public, s-maxage=30, stale-while-revalidate=60");
      return res.status(200).json(data);
    }catch(e){return res.status(502).json({error:e.message})}
  }

  const request=(async()=>{
    const params=new URLSearchParams({method,user,api_key:key,format:"json",limit:type==="recent"?"20":"12",period:"1month"});
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),8000);
    try{
      const r=await fetch(`https://ws.audioscrobbler.com/2.0/?${params}`,{signal:controller.signal});
      const data=await r.json();
      if(!r.ok||data?.error)throw new Error(data?.message||`Last.fm request failed (${r.status})`);

      if(type==="artists"){
        const artists=data?.topartists?.artist||[];
        const enriched=await Promise.all(artists.slice(0,8).map(async artist=>{
          try{
            const p=new URLSearchParams({method:"artist.getinfo",artist:artist.name,api_key:key,format:"json"});
            const rr=await fetch(`https://ws.audioscrobbler.com/2.0/?${p}`,{signal:controller.signal});
            const dd=await rr.json();
            return {...artist,image:dd?.artist?.image||artist.image||[]};
          }catch{return artist}
        }));
        data.topartists={...(data.topartists||{}),artist:enriched.concat(artists.slice(8))};
      }

      cache.set(cacheKey,{time:Date.now(),data});
      return data;
    }finally{clearTimeout(timeout)}
  })();

  inflight.set(cacheKey,request);
  try{
    const data=await request;
    res.setHeader("Cache-Control","public, s-maxage=30, stale-while-revalidate=60");
    return res.status(200).json(data);
  }catch(e){
    return res.status(502).json({error:e.name==="AbortError"?"Last.fm request timed out":e.message});
  }finally{
    if(inflight.get(cacheKey)===request)inflight.delete(cacheKey);
  }
}
