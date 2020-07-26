import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';


export default class KeyVaultCli {
  private readonly executableBin: string;
  private readonly executablePath: string;
  private readonly executor: (command: string) => Promise<any>;

  constructor() {
    this.executor = util.promisify(exec);
    this.executableBin = 'keyvault-cli';
    // dev path
    this.executablePath = path.resolve(`${__dirname}/../bin/${this.executableBin}`);
    // prod path
    if (!fs.existsSync(this.executablePath)) {
      this.executablePath = path.resolve(`${process.resourcesPath}/../bin/${this.executableBin}`);
    }
  }

  async seedGenerate(): Promise<void> {
    // Run binary
    const { stdout, stderr } = await this.executor(`${this.executablePath} portfolio seed generate`);
    this.execOutput(stdout, stderr);
  }

  async mnemonicGenerate(): Promise<void> {
    // Run binary
    const { stdout, stderr } = await this.executor(`${this.executablePath} portfolio seed generate --mnemonic`);
    this.execOutput(stdout, stderr);
  }

  async seedToMnemonicGenerate(): Promise<void> {
    // Run binary
    const { stdout, stderr } = await this.executor(`${this.executablePath} portfolio seed generate --mnemonic --seed=a42b2d973095bb518e45ae5b372dbff9a3aec572ff74b1c8c54749d34b4479eb`);
    this.execOutput(stdout, stderr);
  }

  execOutput(stdout, stderr): void {
    if (stderr) {
      console.error(`error: ${stderr}`);
    }
    console.log(stdout);
  }
}
