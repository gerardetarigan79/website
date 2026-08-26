import fs from "node:fs";

const file = "src/main.jsx";
let source = fs.readFileSync(file, "utf8");

const viewsPattern = /function Views\(\)\{.*?\}\nfunction App/s;
const replacement = `function Views(){const [views,setViews]=useState(null);useEffect(()=>{let cancelled=false;fetch("/api/views",{method:"POST",headers:{Accept:"application/json"}}).then(async r=>{if(!r.ok)throw new Error("Views API returned " + r.status);const x=await r.json();if(typeof x.views!=="number")throw new Error("Views API returned no count");if(!cancelled)setViews(x.views)}).catch(()=>{try{const k="draven-local-views";const v=Number(localStorage.getItem(k)||"0")+1;localStorage.setItem(k,String(v));if(!cancelled)setViews(v)}catch{if(!cancelled)setViews(0)}});return()=>{cancelled=true}},[]);return <div className="views">◉ {views===null?<span className="count-up-text">0</span>:<CountUp key={views} to={views} from={0} separator="," duration={1} startWhen={true} className="count-up-text"/>}</div>}
function App`;

if (!viewsPattern.test(source)) {
  throw new Error("fix-views: Views component not found");
}

source = source.replace(viewsPattern, replacement);
fs.writeFileSync(file, source);
console.log("fix-views: stabilized API-backed CountUp view counter");
