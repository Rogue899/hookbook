import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Get list of changed recipe files in this PR
const diff = execSync('git diff --name-only origin/main...HEAD', { encoding: 'utf8' });
const changedRecipes = diff.split('\n').filter((p) => p.startsWith('src/content/recipes/') && p.endsWith('.md'));

let modified = 0;
for (const file of changedRecipes) {
  const full = path.resolve(file);
  if (!fs.existsSync(full)) continue;
  const content = fs.readFileSync(full, 'utf8');
  // Always downgrade incoming PR recipes to experimental
  const downgraded = content.replace(/^trust:\s*(tested|from-source|theoretical)/m, 'trust: experimental');
  if (downgraded !== content) {
    fs.writeFileSync(full, downgraded);
    modified++;
    console.log(`Downgraded ${file} → experimental`);
  }
}

console.log(`Downgrade complete. Modified: ${modified}`);
