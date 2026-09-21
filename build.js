// No third-party dependencies: copy the deployable static assets into dist.
const fs = require('node:fs');
const path = require('node:path');
const output = path.join(__dirname, 'dist');
fs.mkdirSync(output, { recursive: true });
for (const name of ['index.html', 'styles.css', 'app.js']) {
  fs.copyFileSync(path.join(__dirname, name), path.join(output, name));
}
console.log('Build successful: index.html, styles.css, and app.js are in dist/');
