// Hook PostToolUse : lint du fichier .js qui vient d'être modifié.
// Exit 2 et message sur stderr si ESLint trouve des erreurs.
// Dans tous les autres cas (hors sujet, outil absent), exit 0.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Remonte depuis le fichier jusqu'au dossier qui contient eslint.config.js.
function findProjectDir(start) {
  let dir = start;
  while (true) {
    if (fs.existsSync(path.join(dir, 'eslint.config.js'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function lint(file) {
  if (!file) return 0;

  const absoluteFile = path.resolve(file);
  if (!absoluteFile.endsWith('.js')) return 0;
  if (absoluteFile.includes('node_modules')) return 0;
  if (!fs.existsSync(absoluteFile)) return 0;

  const dir = findProjectDir(path.dirname(absoluteFile));
  if (!dir) return 0;

  const args = ['--no-install', 'eslint', '--quiet', absoluteFile];
  const result = spawnSync('npx', args, { cwd: dir, encoding: 'utf8' });

  // Seul le statut 1 signifie « erreurs de lint trouvées ».
  if (result.error || result.status !== 1) return 0;

  process.stderr.write('ESLint errors: ' + absoluteFile + '\n');
  process.stderr.write(result.stdout);
  return 2;
}

let input = '';
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  let file;
  try {
    file = JSON.parse(input).tool_input.file_path;
  } catch (e) {
    process.exit(0);
  }
  process.exit(lint(file));
});
