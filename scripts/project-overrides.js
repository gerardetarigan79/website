import fs from "node:fs";

const file = "src/main.jsx";
let source = fs.readFileSync(file, "utf8");

const projectsPattern = /function Projects\(\)\{.*?\}\nfunction Skills/s;
const projectsReplacement = `function ProjectCard({logo,name,subtitle,description}){return <div className="project-card project-card-expanded cursor-target"><div className="project-logo-wrap"><img className="project-logo" src={logo} alt={name+" logo"}/></div><div className="project-body"><div className="project-brand"><span>{name}</span></div><h2>{subtitle}</h2><p>{description}</p><a href="#contact">view project <ExternalLink size={10}/></a></div></div>}
function Projects(){return <Page id="projects" kicker="my work" title="projects"><p className="lead">projects i made to improve my daily life.</p><div className="projects-grid"><ProjectCard logo="/projects/doxa.png" name="doxa dock" subtitle="private user application" description="a Discord-side utility toolkit built around private automation, customization, and everyday workflows."/><ProjectCard logo="/projects/vanta.png" name="vanta flow" subtitle="after effects workflow plugin" description="a custom After Effects plugin packed with presets, shortcuts, utilities, and workflow-focused tools to make editing faster."/><ProjectCard logo="/projects/argo.png" name="argo node" subtitle="discord utility bot" description="a Discord utility bot built around automation, server tools, and everyday workflow helpers."/></div></Page>}
function Skills`;

if (!projectsPattern.test(source)) throw new Error("project-overrides: Projects block not found");
source = source.replace(projectsPattern, projectsReplacement);
fs.writeFileSync(file, source);

const stylesPath = "src/styles.css";
let styles = fs.readFileSync(stylesPath, "utf8");
const projectStyles = `

/* Projects: expanded cards with interactive logo treatment. */
.projects-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;width:100%}
.project-card-expanded{width:100%;max-width:none;overflow:hidden}
.project-logo-wrap{height:220px;display:grid;place-items:center;position:relative;overflow:hidden;background:radial-gradient(circle at 50% 50%,#17121f,#0d0d12 72%);perspective:700px}
.project-logo-wrap:after{content:"";position:absolute;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(106,2,151,.22),transparent 68%);opacity:.45;transition:transform .45s ease,opacity .45s ease}
.project-logo{position:relative;z-index:1;width:128px;height:128px;object-fit:contain;filter:drop-shadow(0 16px 24px #000b);transform:translateZ(0) rotate(0deg) scale(1);transition:transform .45s cubic-bezier(.2,.8,.2,1),filter .45s ease}
.project-card-expanded:hover .project-logo{transform:translateZ(28px) rotate(-4deg) scale(1.08);filter:drop-shadow(0 20px 30px #000c) drop-shadow(0 0 18px rgba(106,2,151,.3))}
.project-card-expanded:hover .project-logo-wrap:after{transform:scale(1.35);opacity:.7}
.project-card-expanded .project-brand span{color:#ddd}
@media(max-width:900px){.projects-grid{grid-template-columns:1fr}.project-card-expanded{width:100%}}
`;
if (!styles.includes("/* Projects: expanded cards with interactive logo treatment. */")) styles += projectStyles;
fs.writeFileSync(stylesPath, styles);

console.log("project-overrides: updated project copy, logos, and hover interactions");
