const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('tabAPI', {
  activate: (id) => ipcRenderer.send('tab:activate', id),
  close: (id) => ipcRenderer.send('tab:close', id),
  newTab: () => ipcRenderer.send('tab:new'),
  onUpdate: (cb) => ipcRenderer.on('tabs-updated', (e, data) => cb(data)),
})
