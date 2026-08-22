export default async function handler(req,res){
  const base="https://api.jolpi.ca/ergast/f1/current";
  res.setHeader("Cache-Control","s-maxage=300, stale-while-revalidate=60");
  try{
    const [driverRes,constructorRes,nextRes]=await Promise.all([
      fetch(`${base}/drivers/max_verstappen/driverstandings/`),
      fetch(`${base}/constructors/ferrari/constructorstandings/`),
      fetch(`${base}/next/`)
    ]);
    const responses=[driverRes,constructorRes,nextRes];
    if(responses.some(r=>!r.ok))return res.status(502).json({error:"Jolpica F1 request failed",statuses:responses.map(r=>r.status)});
    const [driver,constructor,next]=await Promise.all(responses.map(r=>r.json()));
    const ds=driver?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0]||null;
    const cs=constructor?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings?.[0]||null;
    const race=next?.MRData?.RaceTable?.Races?.[0]||null;
    return res.status(200).json({driver:ds,constructor:cs,next:race,fetchedAt:new Date().toISOString()});
  }catch(e){return res.status(502).json({error:e.message})}
}