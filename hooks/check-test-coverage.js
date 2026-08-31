#!/usr/bin/env node
// PostToolUse hook: after Edit/Write, warn (non-blocking) if the touched
// source file has no sibling test file yet.

const fs = require("fs");
const path = require("path");

let raw = "";
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(raw || "{}");
  } catch {
    process.exit(0);
  }

  const filePath = input?.tool_input?.file_path;
  if (!filePath) process.exit(0);

  const ext = path.extname(filePath);
  const sourceExts = [".js", ".jsx", ".ts", ".tsx"];
  if (!sourceExts.includes(ext)) process.exit(0);

  const base = path.basename(filePath, ext);
  const dir = path.dirname(filePath);

  // Already a test file, or inside a test folder: nothing to check.
  if (/\.(test|spec)$/.test(base)) process.exit(0);
  if (/[\\/](test|tests|__tests__)([\\/]|$)/.test(dir)) process.exit(0);

  const candidates = [
    path.join(dir, `${base}.test${ext}`),
    path.join(dir, `${base}.spec${ext}`),
    path.join(dir, "tests", `${base}.test${ext}`),
    path.join(dir, "__tests__", `${base}.test${ext}`),
    path.join(dir, "..", "tests", `${base}.test${ext}`),
  ];

  const hasTest = candidates.some((c) => fs.existsSync(c));
  if (!hasTest) {
    console.log(
      `[coverage] No test file found for ${filePath}. Consider the test-writer subagent or /verify.`
    );
  }
  process.exit(0);
});
