#!/usr/bin/env node
// PostToolUse hook: after an Edit/Write touches a .js file inside
// course-api/, lint it with the project's own eslint config and surface
// any issues back to Claude (exit 2 shows stderr to Claude without
// blocking — the edit already happened).
const { execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");

let raw = "";
process.stdin.on("data", (chunk) => {
  raw += chunk;
});
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const filePath = input.tool_input && input.tool_input.file_path;
  if (!filePath || !filePath.endsWith(".js")) process.exit(0);
  if (!fs.existsSync(filePath)) process.exit(0);

  const marker = `${path.sep}course-api${path.sep}`;
  const idx = filePath.indexOf(marker);
  if (idx === -1) process.exit(0); // not part of the API this plugin lints

  const apiRoot = filePath.slice(0, idx + marker.length - 1);
  const relFile = filePath.slice(idx + marker.length);

  try {
    execFileSync("npx", ["eslint", relFile], { cwd: apiRoot, stdio: "pipe" });
    process.exit(0);
  } catch (err) {
    const output =
      (err.stdout || "").toString() + (err.stderr || "").toString();
    console.error(`ESLint found issues in ${relFile}:\n${output}`);
    process.exit(2);
  }
});
