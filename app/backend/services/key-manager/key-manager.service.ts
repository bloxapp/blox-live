import util from 'util';
import { exec } from 'child_process';
import { execPath } from '~app/binaries';
import { Log } from '~app/backend/common/logger/logger';
import { Catch, CatchClass } from '~app/backend/decorators';

@CatchClass<KeyManagerService>()
export default class KeyManagerService {
  private readonly executablePath: string;
  private readonly executor: (command: string) => Promise<any>;
  private logger: Log;

  constructor() {
    this.logger = new Log(KeyManagerService.name);
    this.executor = util.promisify(exec);
    this.executablePath = execPath;
  }

  async createWallet(network: string): Promise<string> {
    const { stdout, stderr } = await this.executor(`${this.executablePath} wallet create --network=${network}`);
    if (stderr) {
      throw new Error(`Cli error: ${stderr}`);
    }
    return stdout.replace('\n', '');
  }

  @Catch({
    displayMessage: 'Create Keyvault account failed'
  })
  async createAccount(seed: string, index: number, network: string, highestSource: string, highestTarget: string, highestProposal: string): Promise<string> {
    try {
      const { stdout } = await this.executor(
        `${this.executablePath} wallet account create --seed=${seed} --index=${index} --network=${network} --accumulate=true --highest-source=${highestSource} --highest-target=${highestTarget} --highest-proposal=${highestProposal}`
      );
      return stdout.replace('\n', '');
    } catch (e) {
      throw new Error(`Create account with index ${JSON.stringify(index)} was failed`);
    }
  }

  async getAccount(seed: string, index: number, network: string, accumulate: boolean = false): Promise<any> {
    let highestSource = '';
    let highestTarget = '';
    let highestProposal = '';

    if (!accumulate) {
      highestSource = '0';
      highestTarget = '1';
      highestProposal = '0';
    } else {
      for (let i = 0; i <= index; i += 1) {
        highestSource += `${i.toString()}${i === index ? '' : ','}`;
        highestTarget += `${(i + 1).toString()}${i === index ? '' : ','}`;
      }
      highestProposal = highestSource;
    }

    const getAccountCommand = `${this.executablePath} \
      wallet account create \
      --seed=${seed} \
      --index=${index} \
      --network=${network} \
      --response-type=object \
      --accumulate=${accumulate} \
      --highest-source=${highestSource} \
      --highest-target=${highestTarget} \
      --highest-proposal=${highestProposal}`;
    try {
      const { stdout } = await this.executor(getAccountCommand);
      return stdout ? JSON.parse(stdout) : {};
    } catch (error) {
      console.error('KeyManagerService::getAccount error', { command: getAccountCommand.replace(seed, '***'), error });
      throw new Error(`Get keyvault account with index ${JSON.stringify(index)} was failed.`);
    }
  }

  async getDepositData(seed: string, index: number, publicKey: string, network: string): Promise<any> {
    const getDepositDataCommand = `${this.executablePath} \
      wallet account deposit-data \
      --seed=${seed} \
      --index=${index} \
      --publickey=${publicKey} \
      --network=${network}`;

    try {
      const { stdout } = await this.executor(getDepositDataCommand);
      return stdout ? JSON.parse(stdout) : {};
    } catch (error) {
      console.error('KeyManagerService::getDepositData error', { command: getDepositDataCommand.replace(seed, '***'), error });
      throw new Error(`Get ${network} deposit account data with index ${JSON.stringify(index)} was failed.`);
    }
  }

  async mnemonicGenerate(): Promise<string> {
    try {
      const { stdout } = await this.executor(`${this.executablePath} mnemonic generate`);
      this.logger.trace(stdout);
      return stdout.replace('\n', '');
    } catch (e) {
      throw new Error('Generate mnemonic failed.');
    }
  }

  @Catch({
    showErrorMessage: true
  })
  async seedFromMnemonicGenerate(mnemonic: string): Promise<string> {
    const defaultMnemonicLengthPhrase = 24;
    if (!mnemonic || mnemonic.length === 0) {
      throw new Error('Mnemonic phrase is empty');
    }
    if (mnemonic.split(' ').length !== defaultMnemonicLengthPhrase) {
      throw new Error('Mnemonic phrase should have 24-word length');
    }
    try {
      const { stdout } = await this.executor(`${this.executablePath} seed generate --mnemonic="${mnemonic}"`);
      return stdout.replace('\n', '');
    } catch (e) {
      throw new Error('Passphrase not correct');
    }
  }

  @Catch({
    showErrorMessage: true
  })
  async getAttestation(network: string): Promise<any> {
    try {
      const { stdout: epochData } = await this.executor(`${this.executablePath} config current-epoch --network ${network}`);
      const epoch = epochData.replace('\n', '');
      const { stdout: slotData } = await this.executor(`${this.executablePath} config current-slot --network ${network}`);
      const slot = slotData.replace('\n', '');
      return {
        epoch: +epoch,
        slot: +slot
      };
    } catch (e) {
      throw new Error('Passphrase not correct');
    }
  }
}
