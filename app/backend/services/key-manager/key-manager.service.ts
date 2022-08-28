import { execPath } from '~app/binaries';
import { selectedSeedMode } from '~app/common/service';
import { Log } from '~app/backend/common/logger/logger';
import { Catch, CatchClass } from '~app/backend/decorators';
import { cliExecutor } from '~app/backend/common/cli-executor';
import Seed from '~app/backend/services/key-manager/Strategy/Seed.strategy';
import SeedLess from '~app/backend/services/key-manager/Strategy/SeedLess.strategy';
import Strategy from '~app/backend/services/key-manager/Strategy/strategy.interface';

@CatchClass<KeyManagerService>()
export default class KeyManagerService {
  private readonly executablePath: string;
  private readonly executor: (command: string) => Promise<any>;
  private logger: Log;
  private strategy: Strategy;

  constructor() {
    this.logger = new Log(KeyManagerService.name);
    this.executor = cliExecutor;
    this.executablePath = execPath;
    if (selectedSeedMode()) {
      this.strategy = new Seed();
    } else {
      this.strategy = new SeedLess();
    }
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
  async createAccount(inputData: string, index: number, network: string, highestSource: string, highestTarget: string, highestProposal: string, accumulate: boolean = true): Promise<string> {
    const object = false;
    const createAccountCommand = this.strategy.getAccountCommand({inputData, index, network, highestTarget, highestProposal, highestSource, object, accumulate});
    try {
      const { stdout } = await this.executor(createAccountCommand);
      return stdout.replace('\n', '');
    } catch (error) {
      console.error('KeyManagerService::createAccount error', { command: createAccountCommand.replace(inputData, '***'), error });
      throw new Error(`Create account with index ${JSON.stringify(index)} was failed`);
    }
  }

  /**
   * Get accounts from seed
   * @param inputData
   * @param index
   * @param network
   * @param accumulate
   */
  async getAccount(inputData: string, index: number, network: string, accumulate: boolean = true): Promise<any> {
    const object = true;
    const accountCommand = this.strategy.getAccountCommand({index, network, inputData, accumulate, object});
    try {
      const { stdout } = await this.executor(accountCommand);
      return stdout ? JSON.parse(stdout) : {};
    } catch (error) {
      console.error('KeyManagerService::getAccount error', { command: accountCommand.replace(inputData, '***'), error });
      throw new Error(`Get keyvault account with index ${JSON.stringify(index)} was failed.`);
    }
  }

  /**
   * Get deposit data from seed
   * @param seed
   * @param index
   * @param publicKey
   * @param network
   */
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
    } catch (error) {
      console.error('KeyManagerService::mnemonicGenerate error', { command: `${this.executablePath} mnemonic generate`, error });
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
