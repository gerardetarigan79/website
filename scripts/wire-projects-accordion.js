import fs from "node:fs";

const path = "src/main.jsx";
let source = fs.readFileSync(path, "utf8");

const importMarker = 'import ASCIIText from "./ASCIIText";';
if (!source.includes('import AccordionGallery from "./AccordionGallery";')) {
  source = source.replace(importMarker, `${importMarker}\nimport AccordionGallery from "./AccordionGallery";`);
}

const start = source.indexOf("function Projects()");
const end = source.indexOf("function Skills(", start);
if (start === -1 || end === -1) throw new Error("wire-projects-accordion: could not find Projects block");

const replacement = `function Projects(){const items=[{image:"/projects/doxa.png",label:"Doxa Dock · Discord user automation toolkit"},{image:"/projects/vanta.png",label:"Vanta Flow · After Effects workflow plugin"},{image:"/projects/argo.png",label:"Argo Node · Discord utility bot"}];return <Page id="projects" kicker="my work" title="projects"><p className="lead">projects i build to improve my workflow.</p><AccordionGallery items={items} defaultIndex={0} expandRatio={0.52} trigger="hover" height={430} gap={10} radius={12} tilt={6} parallax={0.45} className="projects-accordion"/></Page>}`;

source = source.slice(0, start) + replacement + "\n" + source.slice(end);
fs.writeFileSync(path, source);
console.log("wire-projects-accordion: Projects now uses AccordionGallery");
