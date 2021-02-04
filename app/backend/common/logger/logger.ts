import electron from 'electron';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { configure, getLogger, Logger } from 'log4js';

export class Log {
  private readonly logger: Logger;
  private readonly userDataPath: string;

  constructor() {
    this.userDataPath = (electron.app || electron.remote.app).getPath('userData');
    this.logger = getLogger();
    configure({
      'appenders': {
        'console': {
          'type': 'console'
        },
        'fileLog': {
          'type': 'file',
          'filename': path.join(this.userDataPath, 'logs/trace.log'),
          'maxLogSize': 10485760,
          'numBackups': 3
        },
        'app': {
          'type': 'logLevelFilter',
          'level': 'INFO',
          'appender': 'fileLog'
        }
      },
      'categories': {
        'default': { 'appenders': ['app', 'console'], 'level': 'TRACE' },
      }
    });
  }

  error(...args: any[]): void {
    this.logger.error(...args);
  }

  debug(...args: any[]): void {
    this.logger.debug(...args);
  }

  trace(...args: any[]): void {
    this.logger.trace(...args);
  }

  info(...args: any[]): void {
    this.logger.info(...args);
  }

  warn(...args: any[]): void {
    this.logger.warn(...args);
  }

  async getArchivedLogs(): Promise<string> {
    const outputArchivePath = path.join(this.userDataPath, 'logs.zip');
    const output = fs.createWriteStream(outputArchivePath);
    const archive = archiver('zip');

    output.on('close', () => {
      // (`${archive.pointer()} total bytes`);
      // ('archiver has been finalized and the output file descriptor has closed.');
    });

    archive.on('error', (err) => {
        throw err;
    });
    archive.pipe(output);

    // append files from a sub-directory and naming it `new-subdir` within the archive (see docs for more options):
    archive.append(fs.createReadStream(path.join(this.userDataPath, 'logs/error.log.2020-09-01-14')), { name: 'file4.txt' });
    archive.finalize();
    return outputArchivePath;
  }
  /*
  async sendCrashReport(): Promise<void> {
    const BloxApiService = require('../communication-manager/blox-api.service').default;
    const form = new FormData();
    form.append('file', fs.createReadStream('logs/error.log.2020-08-30-14.2'));
    // eslint-disable-next-line no-underscore-dangle
    await BloxApiService.request(METHOD.POST, 'organizations/crash-report', form, { 'Content-Type': 'multipart/form-data' });
  }
  */
}
