// Podpis lokalny (ad hoc) aplikacji na Maca, zanim trafi do DMG.
// Bez niego Mac z procesorem Apple odmówi uruchomienia zmodyfikowanej paczki Electron.
const { execFileSync } = require('child_process');
const path = require('path');

exports.default = async function afterPack(ctx) {
  if (ctx.electronPlatformName !== 'darwin') return;
  const app = path.join(ctx.appOutDir, `${ctx.packager.appInfo.productFilename}.app`);
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', app], { stdio: 'inherit' });
};
