// Bezpieczny most między oknem a systemem plików. Okno nie ma dostępu do Node,
// widzi tylko te funkcje (window.stanczykDesktop).
const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('stanczykDesktop', {
  pathForFile: f => { try { return webUtils.getPathForFile(f) || null; } catch { return null; } },
  chooseSavePath: name => ipcRenderer.invoke('project:choose-save', name),
  writeProject: o => ipcRenderer.invoke('project:write', o),
  openProjectDialog: () => ipcRenderer.invoke('project:open-dialog'),
  readProject: p => ipcRenderer.invoke('project:read', p),
  recent: () => ipcRenderer.invoke('recent:list'),
  removeRecent: p => ipcRenderer.invoke('recent:remove', p),
  reveal: p => ipcRenderer.invoke('shell:reveal', p),
  saveFile: (name, data) => ipcRenderer.invoke('file:save', { name, data }),
  confirmUnsaved: name => ipcRenderer.invoke('dialog:unsaved', name),
  setTitle: o => ipcRenderer.send('window:title', o),
  closeOk: () => ipcRenderer.send('window:close-ok'),
  setLang: l => ipcRenderer.send('app:lang', l),
  onMenu: cb => ipcRenderer.on('menu', (e, action, arg) => cb(action, arg))
});
