#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const path = require("node:path");

const apiDirectory = path.resolve(process.cwd(), "course-api");

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: apiDirectory,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  return result.status ?? 1;
}

let exitCode = 0;

if (run("npm", ["test"]) !== 0) {
  exitCode = 1;
}

if (run("npm", ["run", "lint"]) !== 0) {
  exitCode = 1;
}

process.exit(exitCode);
