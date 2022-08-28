import { exec } from 'child_process';

/**
 * Extended CLI commands executor works in promise-way
 * @param command
 * @param options
 */
export const cliExecutor = (command: string, options: any = {}): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      exec(
        command,
        { maxBuffer: 1024 * 1024 * 100, ...options },
        (error: any, stdout: string, stderr: string) => {
          if (!error) {
            return resolve({ stdout, stderr });
          }
          reject(stderr ?? error);
        }
      );
    } catch (execError) {
      reject(execError);
    }
  });
};
