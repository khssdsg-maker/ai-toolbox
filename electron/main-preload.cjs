const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('appAPI', {
  onFavoriteVideo: (cb) => ipcRenderer.on('app:favorite-video', (e, data) => cb(data)),
  sendFavoriteResult: (result) => ipcRenderer.send('favorite:result', result),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (s) => ipcRenderer.send('settings:set', s),
})
