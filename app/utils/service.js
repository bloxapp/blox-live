import os from 'os';
import moment from 'moment';
import macOsRelease from 'macos-release';
import windowsRelease from 'windows-release';

export const isActive = (to, pathname) => {
  const hasSubDir = to.lastIndexOf('/') > 0 && pathname.lastIndexOf('/') > 0;
  if (hasSubDir) {
    const toSubDirName = to.substr(1, to.lastIndexOf('/') - 1);
    const pathnameSubDirName = pathname.substr(
      1,
      pathname.lastIndexOf('/') - 1
    );
    return toSubDirName === pathnameSubDirName;
  }
  return to === pathname;
};

export const isEmptyObject = (obj) => Object.entries(obj).length === 0 && obj.constructor === Object;

export const precentageCalculator = (current, overall) => {
  if (current === 0 || overall === 0) {
    return 0;
  }
  return Number(((current / overall) * 100).toFixed(0), 2);
};

export const lastDateFormat = (utcDate) => {
  const minutesPassed = Math.abs(moment(utcDate).diff(moment(), 'minutes'));
  const hoursPassed = Math.abs(moment(utcDate).diff(moment(), 'hours'));

  if (hoursPassed < 24) {
    if (minutesPassed < 1) {
      return 'Less than a minute ago';
    }
    if (minutesPassed < 2) {
      return 'About a minute ago';
    }
    if (hoursPassed < 1) {
      return `${minutesPassed} minutes ago`;
    }
    if (hoursPassed === 1) {
      return 'about an hour ago';
    }
    return `about ${hoursPassed} hours ago`;
  }
  if (hoursPassed >= 24 || hoursPassed < 48) {
    // more than 24h but less than 48h
    return moment(utcDate).format('MMM DD, YYYY HH:mm');
  }
  // more than 48 hours
  return moment(utcDate).format('MMM DD, YYYY');
};

export const getOsVersion = () => {
  const type = os.type();
  const release = os.release();
  if (type === 'Darwin') {
    return `${type} ${macOsRelease().name} ${macOsRelease().version}`;
  }
  if (type === 'Windows_NT') {
    return `${type} ${windowsRelease()}`;
  }
  return `${type} ${release}`;
};

export const hexDecode = (hex) => {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
};

export const isVersionHigherOrEqual = (current, defaultValue) => {
  const pattern = /(?<=\..*)\./g;
  // eslint-disable-next-line no-param-reassign
  current = current
    .replace('v', '')
    .replace(pattern, '');
  // eslint-disable-next-line no-param-reassign
  defaultValue = defaultValue
    .replace('v', '')
    .replace(pattern, '');

  return +current >= +defaultValue;
};
