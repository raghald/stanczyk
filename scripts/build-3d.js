// Buduje three3d.js: three.js + loadery + scena Stańczyka w jednej funkcji STANCZYK3D_LIB.
// Funkcja (a nie gotowy obiekt) pozwala eksportowi „Kod na stronę” wkleić ten sam kod przez .toString().
// Uruchom: npm run build:3d
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const root = path.join(__dirname, '..');

// Krój Droid Sans Bold (Apache-2.0) przycięty do łaciny z polskimi znakami
const full = require(path.join(root, 'node_modules/three/examples/fonts/droid/droid_sans_bold.typeface.json'));
const keep = c => { const n = c.codePointAt(0); return (n >= 0x20 && n <= 0x24F) || (n >= 0x2010 && n <= 0x206F) || c === '€'; };
const font = { ...full, glyphs: Object.fromEntries(Object.entries(full.glyphs).filter(([c]) => keep(c))) };
fs.writeFileSync(path.join(root, 'src/font.json'), JSON.stringify(font));

const r = esbuild.buildSync({
  entryPoints: [path.join(root, 'src/three3d.js')], bundle: true, minify: true, format: 'iife', globalName: '__s3d',
  target: 'es2020', write: false, legalComments: 'inline', loader: { '.json': 'json' },
});
const code = r.outputFiles[0].text;
const out = `/* Stańczyk 3D: three.js (MIT, © three.js authors), krój Droid Sans (Apache-2.0, © Google). Wygenerowane przez scripts/build-3d.js. */
window.STANCZYK3D_LIB = function(){
${code}
return __s3d;
};
`;
fs.writeFileSync(path.join(root, 'three3d.js'), out);
console.log('three3d.js', Math.round(out.length / 1024), 'KB');
