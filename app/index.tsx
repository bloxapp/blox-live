import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { webFrame } from 'electron';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import Root from './components/Root';
import { history, configuredStore } from './store';
import './common/styles/main.global.css';

const store = configuredStore();
const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

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
