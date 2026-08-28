import fs from "node:fs";

const path = "src/main.jsx";
let source = fs.readFileSync(path, "utf8");

// Keep brand assets stable. Simple Icons does not provide a dedicated
// Adobe Media Encoder icon, so use the current 2026 Adobe Media Encoder SVG
// through Wikimedia Commons' stable file redirect instead of the generic Adobe mark.
const logoHelper = `const logo=(slug,title,href)=>({src:slug.startsWith("https://")?slug:\`https://cdn.simpleicons.org/\${slug}/ffffff\`,alt:title,title,href});`;
const skillLogoGroups = `const skillLogoGroups={creative:[logo("https://www.adobe.com/cc-shared/assets/img/product-icons/svg/after-effects-40.svg","After Effects","https://www.adobe.com/products/aftereffects.html"),logo("https://www.adobe.com/cc-shared/assets/img/product-icons/svg/photoshop-40.svg","Photoshop","https://www.adobe.com/products/photoshop.html"),logo("https://commons.wikimedia.org/wiki/Special:Redirect/file/Adobe_Media_Encoder_CC_2026_icon.svg","Adobe Media Encoder","https://www.adobe.com/products/media-encoder.html"),logo("adobecreativecloud","Adobe Creative Cloud","https://www.adobe.com/creativecloud.html"),logo("cinema4d","Cinema 4D","https://www.maxon.net/en/cinema-4d"),logo("figma","Figma","https://www.figma.com/")],development:[logo("visualstudiocode","Visual Studio Code","https://code.visualstudio.com/"),logo("git","Git","https://git-scm.com/"),logo("github","GitHub","https://github.com/"),logo("githubactions","GitHub Actions","https://github.com/features/actions"),logo("vercel","Vercel","https://vercel.com/"),logo("cloudflare","Cloudflare","https://www.cloudflare.com/"),logo("html5","HTML5","https://developer.mozilla.org/en-US/docs/Web/HTML"),logo("css3","CSS3","https://developer.mozilla.org/en-US/docs/Web/CSS"),logo("javascript","JavaScript","https://developer.mozilla.org/en-US/docs/Web/JavaScript"),logo("react","React","https://react.dev/"),logo("vite","Vite","https://vite.dev/"),logo("java","Java","https://www.java.com/"),logo("lua","Lua","https://www.lua.org/")],\"databases & data\":[logo("postgresql","PostgreSQL","https://www.postgresql.org/"),logo("mysql","MySQL","https://www.mysql.com/"),logo("sqlite","SQLite","https://www.sqlite.org/"),logo("r","R","https://www.r-project.org/"),logo("https://cloud.rstudio.com/wp-content/uploads/2018/10/RStudio-Logo-white.svg","RStudio","https://posit.co/products/open-source/rstudio/")]};`;

const block = /const logo=.*?;const element3dLogo=.*?;const skillLogoGroups=.*?;\n/s;
if (!block.test(source)) throw new Error("logo-loop-fix: could not find current logo declarations");
source = source.replace(block, `${logoHelper}${skillLogoGroups}\n`);
fs.writeFileSync(path, source);
console.log("logo-loop-fix: fixed Adobe Media Encoder, Java, CSS3 and stabilized Simple Icons URLs");
