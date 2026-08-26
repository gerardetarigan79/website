import fs from "node:fs";

const file = "src/main.jsx";
let source = fs.readFileSync(file, "utf8");

source = source.replace(/\n?import CountUp from ["']\.\/CountUp["'];/, "");

const viewsPattern = /function Views\(\)\{.*?\}\nfunction App/s;
const replacement = `function Views(){const [views,setViews]=useState(null);useEffect(()=>{fetch("/api/views",{method:"POST",headers:{Accept:"application/json"}}).then(async r=>{if(!r.ok)throw new Error("Views API returned " + r.status);const x=await r.json();if(typeof x.views!=="number")throw new Error("Views API returned no count");setViews(x.views)}).catch(()=>{try{const k="draven-local-views";const v=Number(localStorage.getItem(k)||"0")+1;localStorage.setItem(k,String(v));setViews(v)}catch{setViews(0)}})},[]);return <div className="views">◉ {views===null?"":fmtNum(views)}</div>}\nfunction App`;

if (!viewsPattern.test(source)) {
  throw new Error("fix-views: Views component not found");
}

source = source.replace(viewsPattern, replacement);
fs.writeFileSync(file, source);
console.log("fix-views: restored static API-backed view counter");
