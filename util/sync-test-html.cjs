#!/usr/bin/env node
// Inlines the built sion.js (an ES module) into the test HTML pages,
// between the BEGIN/END markers.  Inline module scripts run fine over
// file:// URLs, unlike external module imports which browsers block.
// Runs from the npm `build` script.
const fs = require('fs');
const sion = fs.readFileSync('sion.js', 'utf8').trimEnd();
const begin = '<!-- BEGIN inlined sion.js -->';
const end = '<!-- END inlined sion.js -->';
const block = `${begin}
<script type="module">
${sion}
window.SION = SION;
</script>
${end}`;
const re = new RegExp(`${begin}[\\s\\S]*?${end}`);
for (const file of ['test/index.html', 'test/console-local.html']) {
    const src = fs.readFileSync(file, 'utf8');
    if (!re.test(src)) {
        console.error(`${file}: markers not found; skipped`);
        continue;
    }
    const out = src.replace(re, block);
    if (out !== src) {
        fs.writeFileSync(file, out);
        console.log(`${file}: inlined sion.js`);
    }
}
