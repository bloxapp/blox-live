import React, { Fragment } from 'react';
import fs from 'fs';
import { render } from 'react-dom';
import { webFrame } from 'electron';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import Root from './components/Root';
import { history, configuredStore } from './store';
import './common/styles/main.global.css';

const { ipcMain } = require('electron').remote;

const store = configuredStore();
const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;
console.log('ipcMain', ipcMain);
ipcMain.on('download-file', (event, filePath) => {
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      event.reply('download-file-response', { success: false, error: err.message });
    } else {
      event.reply('download-file-response', { success: true, content: data });
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  if (process.env.WINDOW_ZOOM_LEVEL) {
    const zoomLevel = parseInt(process.env.WINDOW_ZOOM_LEVEL, 10);
    console.log('Using zoom level for web frame:', zoomLevel);
    webFrame.setZoomLevel(zoomLevel);
  }

  return render(
    <AppContainer>
      <Root store={store} history={history} />
    </AppContainer>,
    document.getElementById('root'),
  );
});
