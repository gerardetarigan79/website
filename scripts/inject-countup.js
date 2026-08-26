import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('src/main.jsx');
let source = fs.readFileSync(file, 'utf8');

if (source.includes('import CountUp from "./CountUp"')) process.exit(0);

source = source.replace(
  'import ASCIIText from "./ASCIIText";',
  'import ASCIIText from "./ASCIIText";\nimport CountUp from "./CountUp";'
);

const viewsPattern = /function Views\(\)\{.*?\}\nfunction App/s;
const replacement = `function Views(){const [views,setViews]=useState(null);useEffect(()=>{fetch("/api/views",{method:"POST"}).then(r=>r.json()).then(x=>setViews(x.views)).catch(()=>{const k="draven-local-views";const v=Number(localStorage.getItem(k)||"0")+1;localStorage.setItem(k,v);setViews(v)})},[]);return <div className="views">◉ <CountUp to={views??0} from={0} separator="," duration={1} startWhen={views!==null} className="count-up-text"/></div>}\nfunction App`;

if (!viewsPattern.test(source)) {
  throw new Error('inject-countup: Views component not found; refusing to modify main.jsx');
}

source = source.replace(viewsPattern, replacement);
fs.writeFileSync(file, source);
console.log('inject-countup: wired React Bits CountUp into Views');
