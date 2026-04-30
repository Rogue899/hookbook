/**
 * Validates that all recipe files changed in this PR use `trust: experimental`.
 * CI will reject any PR that claims a higher trust tier — promotion to `tested`
 * is a manual step done by the maintainer after personal verification.
 *
 * Strict enforcement: a missing `trust:` field is a violation. Quoted values
 * (`trust: "tested"`) and varied casing (`Trust:`) are caught — anything other
 * than an unquoted lowercase `experimental` fails the gate.
 */
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
  // Case-insensitive match for the key; capture quoted or unquoted value.
  const match = content.match(/^trust:\s*["']?([\w-]+)["']?\s*$/im);
  if (!match) {
    console.error(`${file}: missing or malformed \`trust:\` field — PRs must declare trust: experimental`);
    violations++;
    continue;
  }
  const value = match[1].toLowerCase();
  if (value !== 'experimental') {
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
