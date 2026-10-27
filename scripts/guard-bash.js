// PreToolUse guard: blocks risky shell commands before Claude runs them.
// Claude Code sends the tool call as JSON on stdin. Exit code 2 blocks the
// call and the stderr message is shown to Claude so it can choose another way.
let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let command = '';
  try {
    command = (JSON.parse(input).tool_input || {}).command || '';
  } catch {
    process.exit(0); // not something we understand — let it through
  }

  const rules = [
    { re: /\bgit\s+push\b.*(--force\b|-f\b)/, why: 'force-push rewrites shared history' },
    { re: /\bgit\s+reset\s+--hard\b/, why: 'git reset --hard throws away work' },
    { re: /\brm\s+-[a-z]*r[a-z]*f|\brm\s+-[a-z]*f[a-z]*r/i, why: 'rm -rf deletes files permanently' },
    { re: /\.env\b(?!\.example)/, why: '.env holds secrets and must not be read or changed' },
  ];

  const hit = rules.find((r) => r.re.test(command));
  if (hit) {
    console.error(`quality-crew guard: blocked "${command}" — ${hit.why}. Ask the user to run it manually if it is really needed.`);
    process.exit(2);
  }
  process.exit(0);
});
