// Test dymny aplikacji desktopowej: `npm run smoke`.
// Zastępuje okna systemowe stałymi odpowiedziami i przechodzi scenariusz:
// sekwencja + preset → zapisz jako → nowy projekt → otwórz zapisany → zamknij z niezapisanymi zmianami.
const { dialog } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');

module.exports = function smoke(win, app) {
  const file = path.join(os.tmpdir(), `stanczyk-smoke-${process.pid}.stanczyk`);
  const errors = [];
  const results = {};
  dialog.showSaveDialog = async () => ({ canceled: false, filePath: file });
  dialog.showMessageBox = async () => ({ response: 1 }); // „Nie zapisuj”
  win.webContents.on('console-message', (e, level, msg) => { if (level >= 3) errors.push(msg); });
  const js = code => win.webContents.executeJavaScript(code, true);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const send = (a, arg) => win.webContents.send('menu', a, arg);
  const finish = code => {
    console.log('SMOKE ' + JSON.stringify({ ok: code === 0, results, errors }, null, 1));
    try { fs.unlinkSync(file); } catch {}
    try { const rf = path.join(app.getPath('userData'), 'recent.json'); fs.writeFileSync(rf, JSON.stringify(JSON.parse(fs.readFileSync(rf, 'utf8')).filter(r => r.path !== file))); } catch {}
    app.exit(code);
  };

  win.webContents.once('did-finish-load', async () => {
    try {
      await wait(1200);
      results.startScreen = await js(`!document.querySelector('#start').hidden`);
      results.noWatermark = await js(`![...document.querySelectorAll('.note')].some(n => !n.hidden && n.textContent.includes('@fritzglowacki'))`);
      await js(`(async () => {
        const mk = (t) => new Promise(r => { const c = document.createElement('canvas'); c.width = 400; c.height = 500; const x = c.getContext('2d');
          x.fillStyle = '#000'; x.fillRect(0, 0, 400, 500); x.fillStyle = '#fff'; x.font = '900 300px sans-serif'; x.fillText(t, 80, 360);
          c.toBlob(b => r(new File([b], t + '.png', {type:'image/png'})), 'image/png'); });
        const dt = new DataTransfer(); for (const f of await Promise.all([mk('A'), mk('B')])) dt.items.add(f);
        document.querySelector('#stNew').click();
        await new Promise(r => setTimeout(r, 300));
        window.dispatchEvent(new DragEvent('drop', {dataTransfer: dt, bubbles: true, cancelable: true}));
        await new Promise(r => setTimeout(r, 800));
        [...document.querySelectorAll('md-filter-chip')].find(c => c.label === 'LED').click();
      })()`);
      await wait(600);
      results.dirtyAfterEdit = await js(`document.querySelector('#projName').classList.contains('dirty')`);
      send('saveAs'); await wait(1500);
      const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
      results.savedFile = { app: saved.app, name: saved.name, preset: saved.settings.preset, seq: saved.sequence.length, thumb: !!saved.thumb, kb: Math.round(fs.statSync(file).size / 1024) };
      results.titleAfterSave = await js(`[document.title, document.querySelector('#projName').classList.contains('dirty')]`);
      send('new'); await wait(800);
      results.afterNew = await js(`[document.querySelector('#srcName').textContent, document.querySelector('#projName').textContent]`);
      send('openPath', file); await wait(1500);
      results.afterOpen = await js(`[document.querySelector('#srcName').textContent, document.querySelector('#projName').textContent, document.querySelectorAll('.thumb:not(.add)').length, [...document.querySelectorAll('md-filter-chip')].filter(c => c.selected).map(c => c.label).includes('LED')]`);
      results.recent = (await js(`window.stanczykDesktop.recent()`)).map(r => r.name);
      await js(`document.querySelector('#c-cell').value = 20; document.querySelector('#c-cell').dispatchEvent(new Event('input'));`);
      await wait(300);
      results.dirtyBeforeClose = await js(`document.querySelector('#projName').classList.contains('dirty')`);
      win.on('closed', () => finish(0));
      win.close();
      setTimeout(() => { results.closeTimeout = true; finish(1); }, 4000);
    } catch (e) { errors.push(String(e && e.stack || e)); finish(1); }
  });
};
