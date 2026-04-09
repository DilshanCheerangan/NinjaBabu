const fs = require("fs");
const path = require("path");

const root = __dirname;
const dist = path.join(root, "dist");
const filesAtRoot = ["index.html", "styles.css", "script.js"];

function rmDist() {
  fs.rmSync(dist, { recursive: true, force: true });
}

function copyFile(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(src, dest);
    } else {
      copyFile(src, dest);
    }
  }
}

rmDist();
fs.mkdirSync(dist, { recursive: true });

for (const name of filesAtRoot) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) {
    console.error(`Missing required file: ${name}`);
    process.exit(1);
  }
  copyFile(p, path.join(dist, name));
}

const publicDir = path.join(root, "public");
if (fs.existsSync(publicDir)) {
  copyDir(publicDir, path.join(dist, "public"));
}

console.log("Built static site to dist/");
