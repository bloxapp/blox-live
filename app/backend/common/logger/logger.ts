import electron from 'electron';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

export class Logger {
  private readonly logger: winston.Logger;
  private readonly userDataPath: string;

  constructor() {
    this.userDataPath = (electron.app || electron.remote.app).getPath('userData');
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      defaultMeta: {
        service: 'blox-live'
      },
      transports: [
        new winston.transports.Console(),
        new winston.transports.DailyRotateFile({
          filename: path.join(this.userDataPath, 'logs/error.log'),
          datePattern: 'YYYY-MM-DD-HH',
          maxSize: '10k',
          maxFiles: 1,
          // zippedArchive: true,
          level: 'error'
        }),
        new winston.transports.DailyRotateFile({
          filename: path.join(this.userDataPath, 'logs/debug.log'),
          datePattern: 'YYYY-MM-DD-HH',
          maxSize: '10k',
          maxFiles: 1,
          // zippedArchive: true,
          level: 'debug'
        })
      ]
    });
  }

  error(message: string, trace?: any): void {
    this.logger.error(message, trace);
  }

  debug(message: string, trace?: any): void {
    this.logger.debug(message, trace);
  }

  async getArchivedLogs(): Promise<string> {
    const outputArchivePath = path.join(this.userDataPath, 'logs.zip');
    const output = fs.createWriteStream(outputArchivePath);
    const archive = archiver('zip');

    output.on('close', () => {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
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
    console.log('SEND REPORT CRASH');
    const form = new FormData();
    form.append('file', fs.createReadStream('logs/error.log.2020-08-30-14.2'));
    // eslint-disable-next-line no-underscore-dangle
    console.log(`multipart/form-data; boundary=${form._boundary}`);
    await BloxApiService.request(METHOD.POST, 'organizations/crash-report', form, { 'Content-Type': 'multipart/form-data' });
    console.log('---->done crash report');
  }
  */
}
