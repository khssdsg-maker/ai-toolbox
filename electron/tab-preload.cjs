const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('tabAPI', {
  activate: (id) => ipcRenderer.send('tab:activate', id),
  close: (id) => ipcRenderer.send('tab:close', id),
  newTab: () => ipcRenderer.send('tab:new'),
  goBack: () => ipcRenderer.send('tab:back'),
  goForward: () => ipcRenderer.send('tab:forward'),
  reload: () => ipcRenderer.send('tab:reload'),
  toggleTranslate: () => ipcRenderer.send('tab:toggle-translate'),
  translatePage: () => ipcRenderer.send('tab:toggle-translate'),
  openExternal: () => ipcRenderer.send('tab:open-external'),
  favLink: () => ipcRenderer.send('tab:favlink'),
  onUpdate: (cb) => ipcRenderer.on('tabs-updated', (e, data) => cb(data)),
  onFavlinkResult: (cb) => ipcRenderer.on('favlink-result', (e, result) => cb(result)),
})
