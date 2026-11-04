#!/usr/bin/env node
// PostToolUse hook: formats the file that was just written/edited with Prettier.
// Prettier picks the parser from the file extension (js, ts, json, css, md, yaml, html, ...).
// Files in languages Prettier doesn't support are skipped.

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let filePath;
  try {
    filePath = JSON.parse(input).tool_input?.file_path;
  } catch {
    process.exit(0);
  }
  if (!filePath || !fs.existsSync(filePath)) process.exit(0);

  // A single command string with shell:true works on Windows (npx.cmd) and Unix alike.
  const result = spawnSync(
    `npx --yes prettier --write --ignore-unknown "${path.basename(filePath)}"`,
    { cwd: path.dirname(filePath), encoding: "utf8", shell: true },
  );

  if (result.status !== 0) {
    // Exit 1 is non-blocking: the error is only shown to the user.
    console.error(
      `prettier failed for ${filePath}:\n${result.stderr || result.stdout || result.error}`,
    );
    process.exit(1);
  }
});
