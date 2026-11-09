// Po spakowaniu aplikacji na Maca, zanim trafi do DMG:
// 1) nazwa „Stańczyk” w Finderze, Docku i na pasku menu (pliki InfoPlist.strings).
//    Wewnętrzna nazwa paczki zostaje bez polskich znaków („Stanczyk”), bo Electron
//    szuka po niej swoich procesów pomocniczych i z „ń” nie startuje.
// 2) podpis lokalny (ad hoc) — bez niego Mac z procesorem Apple nie uruchomi zmodyfikowanej paczki.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DISPLAY = 'Stańczyk';

exports.default = async function afterPack(ctx) {
  if (ctx.electronPlatformName !== 'darwin') return;
  const app = path.join(ctx.appOutDir, `${ctx.packager.appInfo.productFilename}.app`);
  const res = path.join(app, 'Contents', 'Resources');
  const strings = `CFBundleDisplayName = "${DISPLAY}";\nCFBundleName = "${DISPLAY}";\n`;
  for (const lang of ['pl', 'en', 'Base']) {
    const dir = path.join(res, `${lang}.lproj`);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'InfoPlist.strings'), strings, 'utf8');
  }
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', app], { stdio: 'inherit' });
};
