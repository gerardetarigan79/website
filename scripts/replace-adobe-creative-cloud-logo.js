import fs from "node:fs";

const file = "src/main.jsx";
const source = fs.readFileSync(file, "utf8");

const target = 'logo("adobe","Adobe Media Encoder","https://www.adobe.com/products/media-encoder.html")';
const replacement = '{src:"https://www.acquia.com/sites/default/files/styles/large/public/media/image/2023-08/Adobe%20Creative%20Cloud%20Logo_Integration.png?itok=5XsY_hFb",alt:"Adobe Media Encoder",title:"Adobe Media Encoder",href:"https://www.adobe.com/products/media-encoder.html"}';

if (source.includes(replacement)) process.exit(0);
if (!source.includes(target)) {
  console.error("Adobe Media Encoder logo target not found.");
  process.exit(1);
}

fs.writeFileSync(file, source.replace(target, replacement));
console.log("Replaced Adobe Media Encoder logo with the requested Creative Cloud logo.");
