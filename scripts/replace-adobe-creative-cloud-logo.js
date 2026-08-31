import fs from "node:fs";

const file = "src/main.jsx";
let source = fs.readFileSync(file, "utf8");

const target = 'logo("adobe","Adobe Media Encoder","https://www.adobe.com/products/media-encoder.html")';
const replacement = '{src:"https://www.acquia.com/sites/default/files/styles/large/public/media/image/2023-08/Adobe%20Creative%20Cloud%20Logo_Integration.png?itok=5XsY_hFb",alt:"Adobe Media Encoder",title:"Adobe Media Encoder",href:"https://www.adobe.com/products/media-encoder.html"}';

if (!source.includes(replacement) && !source.includes(target)) {
  console.error("Adobe Media Encoder logo target not found.");
  process.exit(1);
}

if (source.includes(target)) {
  source = source.replace(target, replacement);
  console.log("Replaced Adobe Media Encoder logo with the requested Creative Cloud logo.");
}

const birthdateReplacements = [
  ['new Date("2008-09-07T00:00:00+08:00")', 'new Date("2007-09-07T00:00:00+08:00")'],
  ['Date.UTC(2008+years,8,7)-Date.UTC(2008,8,7)', 'Date.UTC(2007+years,8,7)-Date.UTC(2007,8,7)'],
  ['since September 7, 2008', 'since September 7, 2007']
];

for (const [target, replacement] of birthdateReplacements) {
  if (!source.includes(target)) {
    console.error(`Birthdate target not found: ${target}`);
    process.exit(1);
  }
  source = source.replace(target, replacement);
}

fs.writeFileSync(file, source);
console.log("Corrected birthdate to September 7, 2007.");
