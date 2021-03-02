import { remote } from 'electron';
import { notification } from 'antd';
import { Log } from 'backend/common/logger/logger';
import queryString from 'query-string';

export const initApp = () => {
  const placement = 'bottomRight';
  notification.config({ placement });
};

export const deepLink = (onSuccess, onFailure) => {
  remote.app.on('open-url', (_event, data) => {
    if (data) {
      const questionMarkIndex = data.indexOf('//');
      const trimmedCode = data.substring(questionMarkIndex + 2);
      const params : Record<string, any> = queryString.parse(trimmedCode);
      try {
        if (Object.keys(params).length > 0) {
          onSuccess(params);
        } else {
          onFailure('Unknown DeepLink!');
        }
      }
      catch (e) {
        onFailure(e);
      }
    }
  });

  remote.app.on('second-instance', (_event, commandLine) => {
    const cmd = commandLine[2] || commandLine[1];
    if (cmd && cmd.includes('blox-live://')) {
      const questionMarkIndex = cmd.indexOf('//');
      const trimmedCode = cmd.substring(questionMarkIndex + 2);
      const withoutSlash = trimmedCode.slice(0, trimmedCode.length - 1);
      const params : Record<string, any> = queryString.parse(withoutSlash);
      try {
        if (params) {
          const win = remote.getCurrentWindow();
          onSuccess(params);
          win.focus();
        } else {
          onFailure('Unknown DeepLink!');
        }
      }
      catch (e) {
        onFailure(e);
      }
    } else {
      const logger = new Log();
      logger.error('Token is not found', commandLine);
    }
  });
};

export const cleanDeepLink = () => {
  remote.app.removeAllListeners('open-url');
  remote.app.removeAllListeners('second-instance');
};
