// PostToolUse hook: after Claude writes or edits a .js file, run ESLint on it
// from the nearest folder that has a package.json, and show any problems to
// Claude so it fixes them right away. Never blocks; it only reports.
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let file = "";
  try {
    file = JSON.parse(input.replace(/^﻿/, "")).tool_input?.file_path || "";
  } catch {
    process.exit(0);
  }
  if (!file.endsWith(".js") || !fs.existsSync(file)) process.exit(0);

  let dir = path.dirname(file);
  while (dir !== path.dirname(dir) && !fs.existsSync(path.join(dir, "package.json"))) {
    dir = path.dirname(dir);
  }
  if (!fs.existsSync(path.join(dir, "node_modules", "eslint"))) process.exit(0);

  try {
    execFileSync(process.execPath, [path.join(dir, "node_modules", "eslint", "bin", "eslint.js"), file], {
      cwd: dir,
      stdio: "pipe",
    });
    console.log(`ESLint: ${path.basename(file)} is clean.`);
  } catch (err) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: "ESLint found problems in " + file + ":\n" + (err.stdout || "").toString(),
      },
    }));
  }
  process.exit(0);
});
