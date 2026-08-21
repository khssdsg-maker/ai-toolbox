const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('appAPI', {
  onFavoriteVideo: (cb) => ipcRenderer.on('app:favorite-video', (e, data) => cb(data)),
  sendFavoriteResult: (result) => ipcRenderer.send('favorite:result', result),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (s) => ipcRenderer.send('settings:set', s),
  clearFavorites: () => ipcRenderer.send('settings:clear-favorites'),
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  checkForUpdates: () => ipcRenderer.invoke('app:check-updates'),
  windowMinimize: () => ipcRenderer.send('app:minimize'),
  windowMaximize: () => ipcRenderer.send('app:maximize'),
  windowClose: () => ipcRenderer.send('app:close'),
  isWindowMaximized: () => ipcRenderer.invoke('app:is-maximized'),
  fetchSiteMeta: (url) => ipcRenderer.invoke('app:fetch-site-meta', url),
  openDataFolder: () => ipcRenderer.invoke('app:open-data-folder'),
  startDownloadUpdate: () => ipcRenderer.invoke('app:start-download-update'),
  onDownloadProgress: (cb) => ipcRenderer.on('update:download-progress', (e, percent) => cb(percent)),
  scanWallpaperEngine: (customDir) => ipcRenderer.invoke('app:scan-wallpaper-engine', customDir),
  selectWallpaperFolder: () => ipcRenderer.invoke('app:select-wallpaper-folder'),
})
