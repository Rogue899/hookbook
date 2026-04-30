import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const diff = execSync('git diff --name-only origin/main...HEAD', { encoding: 'utf8' });
const changedRecipes = diff.split('\n').filter((p) => p.startsWith('src/content/recipes/') && p.endsWith('.md'));

let violations = 0;
for (const file of changedRecipes) {
  const full = path.resolve(file);
  if (!fs.existsSync(full)) continue;
  const content = fs.readFileSync(full, 'utf8');
  const match = content.match(/^trust:\s*(\w+(?:-\w+)?)/m);
  if (match && match[1] !== 'experimental') {
    console.error(`${file}: trust is "${match[1]}", PRs must use trust: experimental`);
    violations++;
  }
}

if (violations > 0) {
  console.error(`\n${violations} recipe(s) must be re-submitted with trust: experimental`);
  process.exitCode = 1;
} else {
  console.log('All recipe submissions use trust: experimental — OK');
}
