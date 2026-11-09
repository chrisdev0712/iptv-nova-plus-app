const { app, BrowserWindow, Menu, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    backgroundColor: '#090e1c',
    icon: path.join(__dirname, 'icon.ico'),
    title: 'IPTV Nova Plus',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Disables CORS restrictions for Xtream Codes IPTV streaming
      allowRunningInsecureContent: true
    }
  });

  // Remove default menu for a clean Smart TV experience
  Menu.setApplicationMenu(null);

  // In production, load the built dist/index.html
  // In development, load localhost:3000
  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000').catch(() => {
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // F11 Fullscreen toggle
  mainWindow.on('focus', () => {
    globalShortcut.register('F11', () => {
      const isFull = mainWindow.isFullScreen();
      mainWindow.setFullScreen(!isFull);
    });
  });

  mainWindow.on('blur', () => {
    globalShortcut.unregister('F11');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

