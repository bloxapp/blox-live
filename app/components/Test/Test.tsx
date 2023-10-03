import React, { useState } from 'react';

import Connection from '../../backend/common/store-manager/connection';
import InstallProcess from '../../backend/proccess-manager/install.process';
import ReinstallProcess from '../../backend/proccess-manager/reinstall.process';
import UpgradeProcess from '../../backend/proccess-manager/upgrade.process';
import UninstallProcess from '../../backend/proccess-manager/uninstall.process';
import RebootProcess from '../../backend/proccess-manager/reboot.process';
import AccountCreateProcess from '../../backend/proccess-manager/account-create.process';
import KeyManagerService from '../../backend/services/key-manager/key-manager.service';
import KeyVaultService from '../../backend/services/key-vault/key-vault.service';
import SsvKeysService from '../../backend/services/ssv-keys/ssv-keys.service';
import SsvMigrationService from '../../backend/services/ssv-migration/ssv-migration.service';
import AccountService from '../../backend/services/account/account.service';
import WalletService from '../../backend/services/wallet/wallet.service';
import VersionService from '../../backend/services/version/version.service';
import { getValidatorKeysFromSeed } from '../../backend/services/validator-Keys/index';
import OrganizationService from '../../backend/services/organization/organization.service';
import ProcessListener from '../../backend/proccess-manager/proccess.listener';
import BaseStore from '../../backend/common/store-manager/base-store';

import { Link } from 'react-router-dom/esm/react-router-dom';
import config from '../../backend/common/config';
import { reportCrash } from '../common/service';

let isRendered = null;

const Test = () => {
  const keyManagerService = new KeyManagerService();
  const accountService = new AccountService();
  const keyVaultService = new KeyVaultService();
  const walletService = new WalletService();
  const versionService = new VersionService();
  const organizationService = new OrganizationService();
  const ssvKeysService = new SsvKeysService();
  const ssvMigrationService = new SsvMigrationService();
  let [env, setEnv] = useState('');
  let [cryptoKey, setCryptoKey] = useState('');
  let [network, setNetwork] = useState(config.env.PRATER_NETWORK);
  let [accessKeyId, setAccessKeyId] = useState('');
  let [mnemonic, setMnemonic] = useState('');
  let [publicKey, setPublicKey] = useState('');
  let [index, setIndex] = useState(0);
  let [secretAccessKey, setSecretAccessKey] = useState('');
  let [processStatus, setProcessStatus] = useState('');
  // ssv-keys
  let [keyStoreJson, setKeyStoreJson] = useState('');
  let [keyStorePassword, setKeyStorePassword] = useState('');
  let [ownerAddress, setOwnerAddress] = useState('');
  let [operators, setOperators] = useState('');
  let [ownerNonce, setOwnerNonce] = useState(0);
  let [migration2PrivateKey, setMigration2PrivateKey] = useState('');
  let [migrationKeyStoreJson, setMigrationKeyStoreJson] = useState('');
  let [migration1OwnerAddress, setMigration1OwnerAddress] = useState('');
  let [migration2OwnerAddress, setMigration2OwnerAddress] = useState('');
  let [mSeed, setMSeed] = useState('');
  let [mValidatorsCount, setMValidatorsCount] = useState(0);

  if (!isRendered) {
    if (Connection.db().exists('env')) {
      setEnv(Connection.db().get('env'));
    } else {
      setEnv('production');
    }
    isRendered = true;
  }
  return (
    <div>
      <Link to={'/'} style={{ marginLeft: '16px' }}>Back</Link>
      <h1>Environment</h1>
      <select value={env} onChange={(event) => setEnv(event.target.value)}>
        <option value="">-</option>
        <option value="stage">stage</option>
        <option value="production">production</option>
      </select>
      <button
        onClick={() => {
          console.log('set custom env', env);
          Connection.db().setEnv(env);
        }}
      >
        Set Custom Environment
      </button>
      <button
        onClick={() => {
          console.log('delete custom env');
          Connection.db().deleteEnv();
        }}
      >
        Delete Custom Environment
      </button>

      <h1>CLI commands</h1>
      <div>
        <h3>Step 0. Set password and init storage</h3>
        <input type={'text'} value={cryptoKey} onChange={async (event) => await setCryptoKey(event.target.value)}
               placeholder="Password"/>
        <br/>
        <button
          onClick={async () => {
            const isValid = await Connection.db().isCryptoKeyValid(cryptoKey);
            if (isValid) {
              await Connection.db().setCryptoKey(cryptoKey);
              if (Connection.db().exists('credentials')) {
                const credentials: any = Connection.db().get('credentials');
                setAccessKeyId(credentials.accessKeyId);
                setSecretAccessKey(credentials.secretAccessKey);
              }
            } else {
              console.error('password is incorrect');
            }
          }}
        >
          Set password for 15mins
        </button>

        <h3>Step 1. Clean storage</h3>
        <button
          onClick={async () => {
            Connection.db().clear();
            cryptoKey = '';
            accessKeyId = '';
            secretAccessKey = '';
            mnemonic = '';
            setAccessKeyId('');
            setSecretAccessKey('');
            setMnemonic('');
          }}
        >
          Clean config
        </button>
        <h3>Step 2. Install server & key-vault</h3>
        <input type={'text'} value={accessKeyId} onChange={(event) => setAccessKeyId(event.target.value)}
               placeholder="Access Key"/>
        <br/>
        <input type={'text'} value={secretAccessKey} onChange={(event) => setSecretAccessKey(event.target.value)}
               placeholder="Access Key Secret"/>
        <br/>
        <button
          onClick={async () => { // TODO: check this func
            const installProcess = new InstallProcess({ accessKeyId, secretAccessKey });
            const listener = new ProcessListener(setProcessStatus);
            installProcess.subscribe(listener);
            try {
              await installProcess.run();
            } catch (e) {
              setProcessStatus(e);
            }
            console.log('+ Congratulations. Installation is done!');
          }}
        >
          Install
        </button>
        <h3>Step 3. Save mnemonic phrase</h3>
        <input type={'text'} value={mnemonic} onChange={(event) => setMnemonic(event.target.value)}
               placeholder="Mnemonic phrase"/>
        <button onClick={async () => {
          const seed = await keyManagerService.seedFromMnemonicGenerate(mnemonic);
          console.log('seed', seed);
          Connection.db().set('seed', seed);
        }}>
          Set mnemonic phrase
        </button>
        <h2>Select Network</h2>
        <select value={network} onChange={(event) => {
          setNetwork(event.target.value);
          Connection.db().set('network', event.target.value);
          console.log('network:', event.target.value);
        }}>
          <option value={config.env.PRATER_NETWORK}>Test Network</option>
          <option value={config.env.MAINNET_NETWORK}>MainNet Network</option>
        </select>
        <h3>Step 4. Account create</h3>
        <button
          onClick={async () => {
            const accountCreateProcess = new AccountCreateProcess(network);
            const listener = new ProcessListener(setProcessStatus);
            accountCreateProcess.subscribe(listener);
            try {
              await accountCreateProcess.run();
            } catch (e) {
              setProcessStatus(e);
            }
            console.log('+ Congratulations. Account Created');
          }}
        >
          Account Create
        </button>
      </div>
      <p/>
      <div>
        <h2>Other</h2>
        <button
          onClick={async () => {
            const listener = new ProcessListener(setProcessStatus);
            const upgradeProcess = new UpgradeProcess();
            upgradeProcess.subscribe(listener);
            try {
              await upgradeProcess.run();
            } catch (e) {
              setProcessStatus(e);
            }
            console.log('+ Congratulations. Upgrade plugin is done!');
          }}
        >
          Upgrade
        </button>
        <button
          onClick={async () => {
            const listener = new ProcessListener(setProcessStatus);
            const reinstallProcess = new ReinstallProcess();
            reinstallProcess.subscribe(listener);
            try {
              await reinstallProcess.run();
            } catch (e) {
              setProcessStatus(e);
            }
            console.log('+ Congratulations. Re-installation is done!');
          }}
        >
          Reinstall
        </button>
        <button
          onClick={async () => {
            const uninstallProcess = new UninstallProcess();
            const listener = new ProcessListener(setProcessStatus);
            uninstallProcess.subscribe(listener);
            try {
              await uninstallProcess.run();
              accessKeyId = '';
              secretAccessKey = '';
              mnemonic = '';
              setAccessKeyId('');
              setSecretAccessKey('');
              setMnemonic('');
            } catch (e) {
              setProcessStatus(e);
            }
            console.log('+ Uninstallation is done!');
          }}
        >
          Uninstall
        </button>
        <button
          onClick={async () => {
            const rebootProcess = new RebootProcess();
            const listener = new ProcessListener(setProcessStatus);
            rebootProcess.subscribe(listener);
            try {
              await rebootProcess.run();
            } catch (e) {
              setProcessStatus(e);
            }
            console.log('+ Congratulations. Reboot is done!');
          }}
        >
          Reboot
        </button>
        <button
          onClick={async () => {
            await accountService.deleteAllAccounts();
            console.log('+Clean Accounts from storage is done!');
          }}
        >
          Delete Accounts from local/blox/vault-plugin
        </button>
      </div>
      <p/>
      <h2>Local Storage Only</h2>
      <div>
        <button onClick={async () => {
          await keyManagerService.mnemonicGenerate();
        }}>
          Generate Mnemonic
        </button>
        <button onClick={async () => {
          await walletService.createWallet();
        }}>
          Create Wallet
        </button>
        <button onClick={async () => {
          await accountService.createAccount({ indexToRestore: 0 });
        }}>
          Create Account
        </button>
        <button onClick={async () => {
          await accountService.deleteLastIndexedAccount();
        }}>
          Delete Last Indexed Account
        </button>
        <br/>
        <button onClick={async () => {
          console.log(Connection.db().get('seed'));
        }}>
          Show seed in console
        </button>
        <button onClick={async () => {
          console.log(Connection.db().get('keyPair'));
        }}>
          Show key-pair in console
        </button>
        <br/>
        <input type={'text'} value={publicKey} onChange={(event) => setPublicKey(event.target.value)}
               placeholder="Public key"/>
        <input type={'number'} value={index} onChange={(event) => setIndex(+event.target.value)}
               placeholder="Index"/>
        <button onClick={async () => {
          await accountService.getDepositData(publicKey, index, network);
        }}>
          Get Account Deposit Data
        </button>

      </div>
      <p/>
      <h2>Blox API</h2>
      <div>
        <button onClick={async () => {
          await reportCrash();
        }}>
          Report crash
        </button>
        <button onClick={async () => {
          console.log(await walletService.get());
        }}>
          Get wallet
        </button>
        <button onClick={async () => {
          console.log(await accountService.get());
        }}>
          Get Accounts
        </button>
        <button onClick={async () => {
          console.log(await versionService.getLatestKeyVaultVersion());
        }}>
          Get Latest KeyVault Version
        </button>
        <button onClick={async () => {
          console.log(await versionService.getLatestBloxLiveVersion());
        }}>
          Get Latest Blox-Live Version
        </button>
        <button onClick={async () => {
          console.log(await organizationService.get());
        }}>
          Get Organization Profile
        </button>
        <button onClick={async () => {
          console.log(await organizationService.getEventLogs());
        }}>
          Get Organization Event Logs
        </button>
      </div>
      <p/>
      <h2>Vault Plugin API</h2>
      <div>
        <button onClick={async () => {
          console.log(await keyVaultService.healthCheck());
        }}>
          Status
        </button>
        <button onClick={async () => {
          const response = await keyVaultService.listAccounts();
          console.log(response);
        }}>
          List Accounts
        </button>
        <button onClick={async () => {
          const response = await keyVaultService.getVersion();
          console.log(response);
        }}>
          Get Version
        </button>
        <button onClick={async () => {
          await keyVaultService.updateVaultMountsStorage();
        }}>
          Update Storage for both networks
        </button>
        <button onClick={async () => {
          const slashingStorage = await keyVaultService.getSlashingStorage();
          console.log(slashingStorage);
        }}>
          Export Slashing Data
        </button>
      </div>
      <p/>
      <h2>SSV Keys</h2>
      <div>
        <input type={'text'} value={keyStoreJson} onChange={(event) => setKeyStoreJson(event.target.value)} placeholder="Keystore json" />
        <input type={'password'} value={keyStorePassword} onChange={(event) => setKeyStorePassword(event.target.value)} placeholder="Keystore password" />
        <input type={'text'} value={ownerAddress} onChange={(event) => setOwnerAddress(event.target.value)} placeholder="Owner address" />
        <input type={'number'} value={ownerNonce} onChange={(event) => setOwnerNonce(+event.target.value)} placeholder="Owner nonce" />
        <input type={'text'} value={operators} onChange={(event) => setOperators(event.target.value)} placeholder="Operators" />
        <button
          onClick={async () => {
            const keys = await ssvKeysService.extractKeysFromKeystore(JSON.parse(keyStoreJson), keyStorePassword);
            const keyShares = await ssvKeysService.buildKeyShares(keys.publicKey, keys.privateKey, JSON.parse(operators), ownerAddress, ownerNonce);
            console.log(keyShares);
          }}
        >
          Build Keyshares
        </button>
      </div>
      <p/>
      <h2>Migration to SSV Network</h2>
      <div>
        <input type={'text'} value={migrationKeyStoreJson} onChange={(event) => setMigrationKeyStoreJson(event.target.value)} placeholder="Keystore json" />
        <input type={'password'} value={keyStorePassword} onChange={(event) => setKeyStorePassword(event.target.value)} placeholder="Keystore password" />
        <input type={'text'} value={migration1OwnerAddress} onChange={(event) => setMigration1OwnerAddress(event.target.value)} placeholder="Owner address" />
        <button
          onClick={async () => {
            await ssvMigrationService.init();
            const keyShares = await ssvMigrationService.buildByKeystoresAndPassword(migration1OwnerAddress, [JSON.parse(migrationKeyStoreJson)], keyStorePassword);
            console.log('key shares by keystore', keyShares);
          }}
        >
          Build Keyshares by Keystore
        </button>
      </div>
      <p/>
      <div>
        <input type={'text'} value={migration2PrivateKey} onChange={(event) => setMigration2PrivateKey(event.target.value)} placeholder="Private key" />
        <input type={'text'} value={migration2OwnerAddress} onChange={(event) => setMigration2OwnerAddress(event.target.value)} placeholder="Owner address" />
        <button
          onClick={async () => {
            await ssvMigrationService.init();
            const keyShares = await ssvMigrationService.buildByPrivateKeys(migration2OwnerAddress, [migration2PrivateKey]);
            console.log('key shares by private key', keyShares);
          }}
        >
          Build Keyshares by Private key
        </button>
      </div>
      <p/>
      <div>
        <input type={'text'} value={mSeed} onChange={(event) => setMSeed(event.target.value)} placeholder="Seed" />
        <input type={'number'} value={mValidatorsCount} onChange={(event) => setMValidatorsCount(+event.target.value)} placeholder="Validators count" />
        <button
          onClick={async () => {
            const keysFromSeed = await getValidatorKeysFromSeed(mSeed, mValidatorsCount);
            console.log('keys by seed', keysFromSeed);
          }}
        >
          Build Keystores from Seed
        </button>
      </div>
      <h2>Migration process to SSV Network</h2>
      <p/>
      <div>
        <input type={'text'} value={mSeed} onChange={(event) => setMSeed(event.target.value)} placeholder="Seed" />
        <input type={'number'} value={mValidatorsCount} onChange={(event) => setMValidatorsCount(+event.target.value)} placeholder="Validators count" />
        <input type={'text'} value={migration2OwnerAddress} onChange={(event) => setMigration2OwnerAddress(event.target.value)} placeholder="Owner address" />
        <button
          onClick={async () => {
            // 1. extract private keys from seed
            const keysFromSeed = await getValidatorKeysFromSeed(mSeed, mValidatorsCount);
            const privateKeys = keysFromSeed.map((key) => key.privateKey);
            // 2. build keyshares by private keys
            await ssvMigrationService.init();
            const keyShares = await ssvMigrationService.buildByPrivateKeys(migration2OwnerAddress, privateKeys);
            console.log('keyshares', keyShares);
            const filePath = await ssvMigrationService.storeKeyShares(keyShares);
            console.log('keyshares stored at', filePath);
            // 3. Uninstall provess run
            /* ... */
            // 4. Set flag to base store
            const baseStore: BaseStore = new BaseStore();
            await baseStore.set('ssvMigrationBuiltAt', new Date());
          }}
        >
          Run Seed migration mode
        </button>
      </div>
      <p/>
      <textarea value={processStatus} cols={100} rows={10} readOnly={true}></textarea>
    </div>
  );
};

export default Test;
