import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { transformSync } from "@babel/core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.join(__dirname, "..", "src");

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function fixImports(code) {
  let s = code;
  s = s.replace(/from\s+["']([^"']+)\.tsx["']/g, 'from "$1.jsx"');
  s = s.replace(/from\s+["']([^"']+)\.ts["']/g, 'from "$1.js"');
  s = s.replace(/import\s+["']([^"']+)\.tsx["']/g, 'import "$1.jsx"');
  s = s.replace(/import\s+["']([^"']+)\.ts["']/g, 'import "$1.js"');
  return s;
}

const files = walk(srcRoot).filter((f) => {
  if (f.endsWith(".d.ts")) return false;
  if (f.includes(`${path.sep}imports${path.sep}`)) return false;
  if (f.endsWith(".tsx")) return true;
  if (f.endsWith(".ts")) return true;
  return false;
});

for (const file of files) {
  const code = fs.readFileSync(file, "utf8");
  const isTsx = file.endsWith(".tsx");
  const result = transformSync(code, {
    filename: file,
    babelrc: false,
    configFile: false,
    presets: [
      [
        "@babel/preset-typescript",
        {
          isTSX: isTsx,
          allExtensions: true,
          onlyRemoveTypeImports: false,
        },
      ],
    ],
  });
  if (!result?.code) {
    throw new Error(`Babel produced no output for ${file}`);
  }
  const out = fixImports(result.code);
  const outPath = isTsx
    ? file.replace(/\.tsx$/, ".jsx")
    : file.replace(/\.ts$/, ".js");
  fs.writeFileSync(outPath, out, "utf8");
  fs.unlinkSync(file);
}

console.log(`Converted ${files.length} files under src/`);
