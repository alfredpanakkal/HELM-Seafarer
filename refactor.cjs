const fs = require('fs');
const path = require('path');

// 1. Gather all files
const srcDir = path.join(__dirname, 'src');
const getAllFiles = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
};

const files = getAllFiles(srcDir);

// 2. Find all pairs of theme === "dark" ? "A" : "B"
let pairs = new Map();
let pairCounter = 1;

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Find standard theme === 'dark' ? "a" : "b"
  // e.g. theme === "dark" ? "text-slate-200" : "text-slate-800"
  const regex1 = /theme\s*===\s*["']dark["']\s*\?\s*["']([^"']+)["']\s*:\s*["']([^"']+)["']/g;
  
  let match;
  while ((match = regex1.exec(content)) !== null) {
    const darkVal = match[1];
    const lightVal = match[2];
    const key = `${darkVal}|${lightVal}`;
    if (!pairs.has(key)) {
      pairs.set(key, { dark: darkVal, light: lightVal, name: `theme-var-${pairCounter++}` });
    }
  }

  // Find inverted theme === 'light' ? "a" : "b" (just in case)
  const regex2 = /theme\s*===\s*["']light["']\s*\?\s*["']([^"']+)["']\s*:\s*["']([^"']+)["']/g;
  while ((match = regex2.exec(content)) !== null) {
    const lightVal = match[1];
    const darkVal = match[2];
    const key = `${darkVal}|${lightVal}`;
    if (!pairs.has(key)) {
      pairs.set(key, { dark: darkVal, light: lightVal, name: `theme-var-${pairCounter++}` });
    }
  }
});

console.log("Found pairs:", Array.from(pairs.values()));

// 3. Generate CSS
let cssRootLight = '';
let cssRootDark = '';
let cssUtilities = '';

pairs.forEach(pair => {
  // If it's a tailwind color class like text-slate-200
  // Actually, wait! CSS Variables don't map to Tailwind classes easily unless we define custom utility classes or theme colors.
  // The user says "Replace all hardcoded inline/component color declarations with CSS Custom Properties".
  // So for `theme === "dark" ? "text-slate-200" : "text-slate-800"`,
  // we could define a CSS class `.text-theme-var-X` that sets `color: var(--theme-var-X)`.
});
