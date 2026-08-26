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

const replacement = `function Projects(){const items=[{image:"/projects/doxa.png",label:"Doxa Dock",subtitle:"Discord user automation toolkit",description:"Lightweight client utility and automation dashboard I built to give me deeper control over account workflows. It streamlines daily tasks with custom scripts, real-time activity logging, and tailored profile."},{image:"/projects/vanta.png",label:"Vanta Flow",subtitle:"After Effects workflow plugin",description:"Custom After Effects plugin built around essential workflow tools, shortcuts, presets, and utilities to make editing faster and more efficient."},{image:"/projects/argo.png",label:"Argo Node",subtitle:"Discord utility bot",description:"Multipurpose Discord user application that brings smart media utilities, social lookups, and AI tools directly into any chat. Built on Discord's official User App framework."}];return <Page id="projects" kicker="my work" title="projects"><p className="lead">projects i build to improve my workflow.</p><AccordionGallery items={items} defaultIndex={0} expandRatio={0.52} trigger="hover" height={430} gap={10} radius={12} tilt={6} parallax={0.45} className="projects-accordion"/></Page>}`;

source = source.slice(0, start) + replacement + "\n" + source.slice(end);
fs.writeFileSync(path, source);
console.log("wire-projects-accordion: Projects now uses AccordionGallery with project details");
