import electron from 'electron';
// import { createAppWindow } from '../../main.dev';

let win = null;
const { BrowserWindow } = electron.remote;

export const createAuthWindow = (auth, socialAppName, callBack) => {
  destroyAuthWin();

  win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      enableRemoteModule: false,
    },
  });

  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) old-airport-include/1.0.0 Chrome Electron/7.1.7 Safari/537.36';
  win.loadURL(auth.getAuthenticationURL(socialAppName), { userAgent });

  const {
    session: { webRequest },
  } = win.webContents;

  const filter = {
    urls: ['http://localhost/callback*'],
  };

  const listener = async ({ url }) => {
    const tokensResponse = await auth.loadTokens(url);
    await callBack(tokensResponse);
    return destroyAuthWin();
  };

  webRequest.onBeforeRequest(filter, listener);

  if (win) {
    win.on('authenticated', () => {
      destroyAuthWin();
    });
    win.on('closed', () => {
      win = null;
    });
  }
};

function destroyAuthWin() {
  if (!win) return;
  win.close();
  win = null;
}

export const createLogoutWindow = (auth) => {
  const logoutWindow = new BrowserWindow({
    show: false,
  });

  logoutWindow.loadURL(auth.getLogOutUrl());

  logoutWindow.on('ready-to-show', async () => {
    logoutWindow.close();
    await auth.logout();
  });
};
