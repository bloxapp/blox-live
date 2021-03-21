import { remote } from 'electron';
import { notification } from 'antd';
import queryString from 'query-string';
import { Log } from '~app/backend/common/logger/logger';

const logger = new Log('App/services');
const isWindows = process.platform === 'win32';

export const initApp = () => {
  const placement = 'bottomRight';
  notification.config({ placement });
};

export const onSystemResume = (onSuccess, onFailure) => {
  remote.powerMonitor.on('resume', () => {
    try {
      onSuccess({
        state: remote.powerMonitor.getSystemIdleState(4),
        idle: remote.powerMonitor.getSystemIdleTime()
      });
    } catch (e) {
      onFailure(e);
    }
  });
};

export const cleanOnSystemResume = () => {
  remote.powerMonitor.removeAllListeners('resume');
};

export const onUnlockScreen = (onSuccess, onFailure) => {
  remote.powerMonitor.on('unlock-screen', () => {
    try {
      onSuccess({
        state: remote.powerMonitor.getSystemIdleState(4),
        idle: remote.powerMonitor.getSystemIdleTime()
      });
    } catch (e) {
      onFailure(e);
    }
  });
};

export const cleanOnUnlockScreen = () => {
  remote.powerMonitor.removeAllListeners('unlock-screen');
};

export const onWindowFocus = (onSuccess, onFailure) => {
  remote.app.on('browser-window-focus', (event, window) => {
    try {
        onSuccess(event, window);
    } catch (e) {
      onFailure(e);
    }
  });
};

export const cleanOnWindowFocus = () => {
  remote.app.removeAllListeners('browser-window-focus');
};

export const deepLink = (onSuccess, onFailure) => {
  remote.app.on('open-url', (_event, data) => {
    if (data) {
      let params: Record<string, any>;
      if (isWindows) {
        const questionMarkIndex = data.indexOf('//');
        const trimmedCode = data.substring(questionMarkIndex + 2);
        params = queryString.parse(trimmedCode);
      } else {
        const [, query] = data.split('//');
        params = queryString.parse(query);
      }
      try {
        if (Object.keys(params).length > 0) {
          onSuccess(params);
        } else {
          onFailure('Unknown DeepLink!');
        }
      } catch (e) {
        onFailure(e);
      }
    }
  });

  remote.app.on('second-instance', (_event, commandLine) => {
    logger.trace(commandLine);
    const cmd = commandLine[2] || commandLine[1];
    if (cmd && cmd.includes('blox-live://')) {
      let params: Record<string, any>;
      if (isWindows) {
        const questionMarkIndex = cmd.indexOf('//');
        const trimmedCode = cmd.substring(questionMarkIndex + 2);
        const withoutSlash = trimmedCode.slice(0, trimmedCode.length - 1);
        params = queryString.parse(withoutSlash);
      } else {
        const [, query] = cmd.split('//');
        params = queryString.parse(query);
      }
      try {
        if (params) {
          const win = remote.getCurrentWindow();
          onSuccess(params);
          win.focus();
        } else {
          onFailure('Unknown DeepLink!');
        }
      } catch (e) {
        onFailure(e);
      }
    } else {
      logger.error('Token is not found', commandLine);
    }
  });
};

export const cleanDeepLink = () => {
  remote.app.removeAllListeners('open-url');
  remote.app.removeAllListeners('second-instance');
};
