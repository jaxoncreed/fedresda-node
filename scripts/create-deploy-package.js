#!/usr/bin/env node
/**
 * Creates the Docker Compose deployment package (tar.gz) from the built project.
 * Run from repo root after `npm run build`. No network calls.
 *
 * Output: build/fedresda-node-deploy-<version>.tar.gz
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const deployDir = path.join(repoRoot, "deploy");
const buildDir = path.join(repoRoot, "build", "deploy-package");
const version =
  (() => {
    try {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(repoRoot, "package.json"), "utf8")
      );
      return (pkg.version || "0.0.0").replace(/[^\w.-]/g, "_");
    } catch {
      return "0.0.0";
    }
  })();
const outName = `fedresda-node-deploy-${version}.tar.gz`;
const outPath = path.join(repoRoot, "build", outName);
const tarTopDir = "fedresda-node-deploy";

const entries = [
  { from: deployDir, to: ".", names: [".env.example", "README.md", "docker-compose.yml", "Dockerfile", "Dockerfile.triplestore", "entrypoint.sh"] },
  { from: path.join(deployDir, "nginx"), to: "nginx", names: ["entrypoint.sh"] },
  { from: path.join(deployDir, "nginx", "templates"), to: "nginx/templates", names: ["default.conf.template"] },
  { from: path.join(deployDir, "proxy-examples"), to: "proxy-examples", names: ["custom-nginx.conf"] },
  { from: path.join(deployDir, "docs"), to: "docs", names: ["server-trust-proxy-snippet.md"] },
];

const fromRepo = [
  "package.json",
  "package-lock.json",
  "dist",
  "config",
  "templates",
  "node_modules",
];

function copyFile(src, dst) {
  const dir = path.dirname(dst);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(src, dst);
}

function copyRecursive(src, dst) {
  if (!fs.existsSync(src)) return;
  const st = fs.statSync(src);
  if (st.isFile()) {
    const dir = path.dirname(dst);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(src, dst);
    return;
  }
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    copyRecursive(path.join(src, name), path.join(dst, name));
  }
}

function main() {
  if (!fs.existsSync(path.join(repoRoot, "dist", "index.js"))) {
    console.error("Run 'npm run build' first.");
    process.exit(1);
  }

  if (fs.existsSync(buildDir)) fs.rmSync(buildDir, { recursive: true });
  const stageDir = path.join(buildDir, tarTopDir);
  fs.mkdirSync(stageDir, { recursive: true });

  for (const { from, to, names } of entries) {
    for (const name of names) {
      const src = path.join(from, name);
      if (!fs.existsSync(src)) continue;
      const dst = path.join(stageDir, to, name);
      if (fs.statSync(src).isDirectory()) copyRecursive(src, dst);
      else copyFile(src, dst);
    }
  }

  for (const name of fromRepo) {
    const src = path.join(repoRoot, name);
    const dst = path.join(stageDir, name);
    if (!fs.existsSync(src)) {
      if (name === "node_modules") {
        console.error("node_modules not found. Run 'npm install' and 'npm run build'.");
        process.exit(1);
      }
      continue;
    }
    copyRecursive(src, dst);
  }

  // Only include ui/dist-server for the app (Dockerfile expects ./ui/dist-server)
  const uiDistServer = path.join(repoRoot, "ui", "dist-server");
  if (fs.existsSync(uiDistServer)) {
    copyRecursive(uiDistServer, path.join(stageDir, "ui", "dist-server"));
  } else {
    console.error("ui/dist-server not found. Run 'npm run build' (including build:ui).");
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  execSync(`tar -czf "${outPath}" -C "${buildDir}" "${tarTopDir}"`, { stdio: "inherit" });
  console.log(`Created ${outPath}`);
  console.log(`Extract with: tar -xzf ${outName} && cd ${tarTopDir}`);
}

main();
