import fs from "node:fs";

const path = "src/main.jsx";
let source = fs.readFileSync(path, "utf8");

const oldBlock = /const element3dLogo=.*?;const skillLogoGroups=.*?;\n/;
const newBlock = `const skillLogoGroups={creative:[logo("adobeaftereffects","After Effects","https://www.adobe.com/products/aftereffects.html"),logo("adobephotoshop","Photoshop","https://www.adobe.com/products/photoshop.html"),logo("adobecreativecloud","Adobe Creative Cloud","https://www.adobe.com/creativecloud.html"),logo("cinema4d","Cinema 4D","https://www.maxon.net/en/cinema-4d"),logo("figma","Figma","https://www.figma.com/")],development:[logo("visualstudiocode","Visual Studio Code","https://code.visualstudio.com/"),logo("git","Git","https://git-scm.com/"),logo("github","GitHub","https://github.com/"),logo("githubactions","GitHub Actions","https://github.com/features/actions"),logo("vercel","Vercel","https://vercel.com/"),logo("cloudflare","Cloudflare","https://www.cloudflare.com/"),logo("html5","HTML5","https://developer.mozilla.org/en-US/docs/Web/HTML"),logo("css3","CSS3","https://developer.mozilla.org/en-US/docs/Web/CSS"),logo("javascript","JavaScript","https://developer.mozilla.org/en-US/docs/Web/JavaScript"),logo("react","React","https://react.dev/"),logo("vite","Vite","https://vite.dev/"),logo("java","Java","https://www.java.com/"),logo("lua","Lua","https://www.lua.org/")],"databases & data":[logo("postgresql","PostgreSQL","https://www.postgresql.org/"),logo("mysql","MySQL","https://www.mysql.com/"),logo("sqlite","SQLite","https://www.sqlite.org/"),logo("r","R","https://www.r-project.org/"),logo("rstudio","RStudio","https://posit.co/products/open-source/rstudio/")]};
`;

if (!oldBlock.test(source)) throw new Error("logo-loop-fix: could not find skillLogoGroups block");
source = source.replace(oldBlock, newBlock);
fs.writeFileSync(path, source);
console.log("logo-loop-fix: Adobe Creative Cloud + Cinema 4D installed; Element 3D removed");
