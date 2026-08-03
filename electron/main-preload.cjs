const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('appAPI', {
  onFavoriteVideo: (cb) => ipcRenderer.on('app:favorite-video', (e, data) => cb(data)),
})
