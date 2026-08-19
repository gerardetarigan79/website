export default async function handler(req,res){
  const url=process.env.KV_REST_API_URL, token=process.env.KV_REST_API_TOKEN;
  if(url&&token){
    try{
      const r=await fetch(`${url}/incr/draven_views`,{method:"POST",headers:{Authorization:`Bearer ${token}`}});
      const j=await r.json();
      return res.status(200).json({views:Number(j.result||0)});
    }catch(e){}
  }
  return res.status(200).json({views:null,storage:"local-fallback"});
}