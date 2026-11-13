// Stańczyk — proces główny aplikacji desktopowej (Electron).
// Okno, menu „Plik”, zapis i odczyt projektów .stanczyk (oraz starszych .kropkarnia), lista ostatnich projektów.
const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs/promises');

const EXT = 'stanczyk';
const EXTS = [EXT, 'kropkarnia']; // .kropkarnia — projekty sprzed zmiany nazwy
const FILTER = () => [{ name: T('Projekt Stańczyka'), extensions: EXTS }];
// Język menu i okien systemowych: ustawiany przez okno aplikacji (app:lang); domyślnie polski
const EN = {"Projekt Stańczyka": "Stańczyk project", "O Stańczyku": "About Stańczyk", "Ukryj Stańczyka": "Hide Stańczyk", "Ukryj pozostałe": "Hide Others", "Pokaż wszystko": "Show All", "Zakończ Stańczyka": "Quit Stańczyk", "Plik": "File", "Nowy projekt": "New Project", "Otwórz projekt…": "Open Project…", "Otwórz ostatnie": "Open Recent", "Wyczyść listę": "Clear List", "Brak ostatnich projektów": "No Recent Projects", "Ekran projektów": "Projects Screen", "Ustawienia projektu…": "Project Settings…", "Zapisz": "Save", "Zapisz jako…": "Save As…", "Zamknij okno": "Close Window", "Edycja": "Edit", "Cofnij": "Undo", "Ponów": "Redo", "Wytnij": "Cut", "Kopiuj": "Copy", "Wklej": "Paste", "Zaznacz wszystko": "Select All", "Widok": "View", "Odśwież": "Reload", "Narzędzia deweloperskie": "Developer Tools", "Powiększ podgląd": "Zoom In Preview", "Pomniejsz podgląd": "Zoom Out Preview", "Dopasuj podgląd do okna": "Fit Preview to Window", "Podgląd 100 %": "Preview 100%", "Pełny ekran": "Full Screen", "Okno": "Window", "Zapisz projekt": "Save Project", "Otwórz projekt": "Open Project", "Otwórz": "Open", "Zapisz plik": "Save File", "Nie zapisuj": "Don't Save", "Anuluj": "Cancel", "Bez tytułu": "Untitled", "Jeśli nie zapiszesz, wprowadzone zmiany przepadną.": "If you don't save, your changes will be lost."};
let LANG = 'pl';
const T = t => LANG === 'en' ? (EN[t] || t) : t;
let win = null;
let allowClose = false;
let pendingOpen = null;

/* ---------- ostatnie projekty ---------- */
const recentFile = () => path.join(app.getPath('userData'), 'recent.json');
async function readRecent() {
  try { return JSON.parse(await fs.readFile(recentFile(), 'utf8')); } catch { return []; }
}
async function writeRecent(list) {
  await fs.mkdir(path.dirname(recentFile()), { recursive: true });
  await fs.writeFile(recentFile(), JSON.stringify(list));
  buildMenu(list);
}
async function pushRecent(entry) {
  const list = (await readRecent()).filter(r => r.path !== entry.path);
  list.unshift(entry);
  await writeRecent(list.slice(0, 12));
  app.addRecentDocument(entry.path);
}
const baseName = p => path.basename(p).replace(/\.(stanczyk|kropkarnia)$/i, '');

/* ---------- menu ---------- */
const send = (action, arg) => { if (win) win.webContents.send('menu', action, arg); };
function buildMenu(recent = []) {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ label: app.name, submenu: [
      { role: 'about', label: T('O Stańczyku') }, { type: 'separator' },
      { role: 'hide', label: T('Ukryj Stańczyka') }, { role: 'hideOthers', label: T('Ukryj pozostałe') }, { role: 'unhide', label: T('Pokaż wszystko') },
      { type: 'separator' }, { role: 'quit', label: T('Zakończ Stańczyka') }] }] : []),
    { label: T('Plik'), submenu: [
      { label: T('Nowy projekt'), accelerator: 'CmdOrCtrl+N', click: () => send('new') },
      { label: T('Otwórz projekt…'), accelerator: 'CmdOrCtrl+O', click: () => send('open') },
      { label: T('Otwórz ostatnie'), submenu: recent.length
        ? [...recent.map(r => ({ label: r.name, click: () => send('openPath', r.path) })), { type: 'separator' },
           { label: T('Wyczyść listę'), click: async () => { await writeRecent([]); app.clearRecentDocuments(); send('recentChanged'); } }]
        : [{ label: T('Brak ostatnich projektów'), enabled: false }] },
      { label: T('Ekran projektów'), accelerator: 'CmdOrCtrl+Shift+P', click: () => send('showStart') },
      { label: T('Ustawienia projektu…'), accelerator: 'CmdOrCtrl+,', click: () => send('settings') },
      { type: 'separator' },
      { label: T('Zapisz'), accelerator: 'CmdOrCtrl+S', click: () => send('save') },
      { label: T('Zapisz jako…'), accelerator: 'CmdOrCtrl+Shift+S', click: () => send('saveAs') },
      { type: 'separator' },
      { role: 'close', label: T('Zamknij okno') }] },
    { label: T('Edycja'), submenu: [
      { role: 'undo', label: T('Cofnij') }, { role: 'redo', label: T('Ponów') }, { type: 'separator' },
      { role: 'cut', label: T('Wytnij') }, { role: 'copy', label: T('Kopiuj') }, { role: 'paste', label: T('Wklej') }, { role: 'selectAll', label: T('Zaznacz wszystko') }] },
    { label: T('Widok'), submenu: [
      { role: 'reload', label: T('Odśwież') }, { role: 'toggleDevTools', label: T('Narzędzia deweloperskie') }, { type: 'separator' },
      { label: T('Powiększ podgląd'), accelerator: 'CmdOrCtrl+=', click: () => send('zoomIn') },
      { label: T('Pomniejsz podgląd'), accelerator: 'CmdOrCtrl+-', click: () => send('zoomOut') },
      { label: T('Dopasuj podgląd do okna'), accelerator: 'CmdOrCtrl+0', click: () => send('zoomFit') },
      { label: T('Podgląd 100 %'), accelerator: 'CmdOrCtrl+1', click: () => send('zoom100') },
      { type: 'separator' }, { role: 'togglefullscreen', label: T('Pełny ekran') }] },
    { role: 'windowMenu', label: T('Okno') }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/* ---------- okno ---------- */
function createWindow() {
  win = new BrowserWindow({
    width: 1440, height: 960, minWidth: 900, minHeight: 640,
    backgroundColor: '#0E0F11', title: 'Stańczyk', show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.loadFile(path.join(__dirname, '..', 'index.html'));
  win.once('ready-to-show', () => win.show());
  win.on('close', e => { if (allowClose) return; e.preventDefault(); send('closeRequest'); });
  win.on('closed', () => { win = null; allowClose = false; });
  win.webContents.on('did-finish-load', () => { if (pendingOpen) { send('openPath', pendingOpen); pendingOpen = null; } });
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  if (process.env.STANCZYK_SMOKE) require('./smoke')(win, app);
}

/* ---------- most z oknem ---------- */
ipcMain.handle('project:choose-save', async (e, name) => {
  const r = await dialog.showSaveDialog(win, {
    title: T('Zapisz projekt'), buttonLabel: T('Zapisz'),
    defaultPath: path.join(app.getPath('documents'), (name || T('Bez tytułu')) + '.' + EXT), filters: FILTER()
  });
  return r.canceled ? null : { path: r.filePath, name: baseName(r.filePath) };
});
ipcMain.handle('project:write', async (e, { path: p, json, name, thumb }) => {
  await fs.writeFile(p, json, 'utf8');
  await pushRecent({ path: p, name, saved: Date.now(), thumb });
  return true;
});
async function readProject(p) {
  const text = await fs.readFile(p, 'utf8');
  let thumb = null, name = baseName(p);
  try { const j = JSON.parse(text); thumb = j.thumb || null; } catch {}
  await pushRecent({ path: p, name, saved: (await fs.stat(p)).mtimeMs, thumb });
  return { path: p, name, text };
}
ipcMain.handle('project:open-dialog', async () => {
  const r = await dialog.showOpenDialog(win, { title: T('Otwórz projekt'), buttonLabel: T('Otwórz'), properties: ['openFile'], filters: FILTER() });
  return r.canceled || !r.filePaths[0] ? null : readProject(r.filePaths[0]);
});
ipcMain.handle('project:read', (e, p) => readProject(p));
ipcMain.handle('recent:list', async () => {
  const list = await readRecent();
  return Promise.all(list.map(async r => ({ ...r, missing: await fs.access(r.path).then(() => false, () => true) })));
});
ipcMain.handle('recent:remove', async (e, p) => { await writeRecent((await readRecent()).filter(r => r.path !== p)); return true; });
ipcMain.handle('file:save', async (e, { name, data }) => {
  const ext = path.extname(name).slice(1);
  const r = await dialog.showSaveDialog(win, {
    title: T('Zapisz plik'), buttonLabel: T('Zapisz'), defaultPath: path.join(app.getPath('downloads'), name),
    filters: ext ? [{ name: ext.toUpperCase(), extensions: [ext] }] : []
  });
  if (r.canceled) return null;
  await fs.writeFile(r.filePath, Buffer.from(data));
  return r.filePath;
});
ipcMain.handle('dialog:unsaved', async (e, name) => {
  const r = await dialog.showMessageBox(win, {
    type: 'warning', buttons: [T('Zapisz'), T('Nie zapisuj'), T('Anuluj')], defaultId: 0, cancelId: 2,
    message: LANG === 'en' ? `Save changes to “${name}”?` : `Zapisać zmiany w projekcie „${name}”?`, detail: T('Jeśli nie zapiszesz, wprowadzone zmiany przepadną.')
  });
  return ['save', 'discard', 'cancel'][r.response];
});
ipcMain.on('window:title', (e, { title, dirty, path: p }) => {
  if (!win) return;
  if (process.platform === 'darwin') { win.setTitle(title); win.setDocumentEdited(!!dirty); win.setRepresentedFilename(p || ''); }
  else win.setTitle((dirty ? '● ' : '') + title);
});
ipcMain.on('app:lang', async (e, l) => { const n = l === 'en' ? 'en' : 'pl'; if (n === LANG) return; LANG = n; buildMenu(await readRecent()); });
ipcMain.on('window:close-ok', () => { if (!win) return; allowClose = true; win.close(); });
ipcMain.handle('shell:reveal', (e, p) => shell.showItemInFolder(p));

/* ---------- cykl życia ---------- */
const openPath = p => { if (win && !win.webContents.isLoading()) { send('openPath', p); if (win.isMinimized()) win.restore(); win.focus(); } else pendingOpen = p; };
const projectArg = argv => argv.slice(1).find(a => EXTS.some(x => a.toLowerCase().endsWith('.' + x)));
// macOS: dwuklik w Finderze; Windows: ścieżka w argumentach, a kolejne pliki trafiają do już otwartej aplikacji
app.on('open-file', (e, p) => { e.preventDefault(); openPath(p); });
if (!process.env.STANCZYK_SMOKE && !app.requestSingleInstanceLock()) app.quit();
app.on('second-instance', (e, argv) => { const p = projectArg(argv); if (p) openPath(p); else if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
if (process.platform !== 'darwin') { const p = projectArg(process.argv); if (p) pendingOpen = p; }
app.whenReady().then(async () => {
  app.setName('Stańczyk');
  buildMenu(await readRecent());
  createWindow();
  app.on('activate', () => { if (!win) createWindow(); });
});
app.on('window-all-closed', () => app.quit());
