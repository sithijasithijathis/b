import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

// The built directory structure
process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    title: 'ST TV',
    icon: path.join(process.env.VITE_PUBLIC, 'icon.ico'),
    backgroundColor: '#0B0F19',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false, // For testing CORS/video issues, typically true in production with careful CSP
    },
  });

  // Hide the menu bar
  win.setMenuBarVisibility(false);

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    // win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'));
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.whenReady().then(() => {
  createWindow();
});

ipcMain.handle('get-app-version', () => app.getVersion());

ipcMain.on('window-controls', (event, action) => {
  if (!win) return;
  switch (action) {
    case 'minimize':
      win.minimize();
      break;
    case 'maximize':
      if (win.isMaximized()) win.unmaximize();
      else win.maximize();
      break;
    case 'close':
      win.close();
      break;
    case 'fullscreen':
      win.setFullScreen(!win.isFullScreen());
      break;
  }
});
