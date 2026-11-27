const fs = require("fs");

let raw = "";
process.stdin.on("data", (chunk) => {
  raw += chunk;
});

process.stdin.on("end", () => {
  let filePath;
  try {
    filePath = JSON.parse(raw).tool_input.file_path;
  } catch {
    process.exit(0);
  }

  if (!filePath || !filePath.endsWith(".js") || !fs.existsSync(filePath)) {
    process.exit(0);
  }

  const source = fs.readFileSync(filePath, "utf8");
  const problems = [];

  if (/\b(test|it|describe)\.only\(/.test(source)) {
    problems.push(".only() left in a test");
  }
  if (/\bdebugger;/.test(source)) {
    problems.push("debugger statement left in code");
  }

  if (problems.length > 0) {
    console.error(`${filePath}: ${problems.join(", ")}. Please remove it.`);
    process.exit(2);
  }
});
