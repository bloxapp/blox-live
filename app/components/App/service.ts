import { remote } from 'electron';
import { notification } from 'antd';
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
    if (commandLine[2].includes('blox-live://')) {
      const questionMarkIndex = commandLine[2].indexOf('//');
      const trimmedCode = commandLine[2].substring(questionMarkIndex + 2);
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
    }
  });
};

export const cleanDeepLink = () => {
  remote.app.removeAllListeners('open-url');
  remote.app.removeAllListeners('second-instance');
};
