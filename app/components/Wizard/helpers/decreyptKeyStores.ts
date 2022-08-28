import * as fs from 'fs';
import EthereumKeyStore from 'eth2-keystore-js';
import * as Bls from 'bls-eth-wasm/browser';

/**
 * Extract not extracted keystores using password
 * @param decryptedKeyStores
 * @param keyStoresFiles
 * @param password
 * @param callBack
 */

type Props = {
  decryptedKeyStores: any[],
  keyStoresFiles: File[],
  password: string,
  callBack: any,
  hashExistingPublicKeys: string[],
  network: string,
  actionFlow?: string
};

export const extractKeyStores = async (props: Props) => {
  const {decryptedKeyStores, keyStoresFiles, hashExistingPublicKeys, password, callBack, actionFlow, network} = props;
  const files: any = await readAllFiles(keyStoresFiles);
  await Bls.init(Bls.BLS12_381);
  const keyStores = [];
  // eslint-disable-next-line guard-for-in,no-restricted-syntax
  for (const i in files) {
    try {
      // @ts-ignore
      const keyStore = new EthereumKeyStore(files[i].fileTextPlain);
      // eslint-disable-next-line no-await-in-loop
      const keyStorePrivateKey = await keyStore.getPrivateKey(password);
      const keyStorePublicKey = Bls.deserializeHexStrToSecretKey(keyStorePrivateKey).getPublicKey().serializeToHexStr();

      let keyStoreAlreadyDecrypted = false;
      for (let keyStoreIndex = 0; keyStoreIndex < decryptedKeyStores.length; keyStoreIndex += 1) {
        if (decryptedKeyStores[keyStoreIndex].publicKey === keyStorePublicKey) {
          keyStoreAlreadyDecrypted = true;
          break;
        }
      }

      if (actionFlow === 'create' && hashExistingPublicKeys[`0x${keyStorePublicKey}.${network}`]) {
        throw Error(`Keystore: ${files[i].fileName} (${`0x${keyStorePublicKey.substr(0, 4)}...${keyStorePublicKey.substr(keyStorePublicKey.length - 4, 4)}`}) already exists in your account.`);
      }

      if (actionFlow === 'recovery' && !hashExistingPublicKeys[`0x${keyStorePublicKey}`]) {
        throw Error(`0x${keyStorePublicKey.substr(0, 4)}...${keyStorePublicKey.substr(keyStorePublicKey.length - 4, 4)} is not one of your validators. Please add it after recovering your account`);
      }

      if (!keyStoreAlreadyDecrypted) {
        keyStores.push({
          // @ts-ignore
          fileName: files[i].fileName,
          // eslint-disable-next-line no-await-in-loop
          privateKey: keyStorePrivateKey,
          publicKey: keyStorePublicKey,
          deposited: null,
          network
        });
      }
      callBack(parseInt(i, 10) + 1);
    } catch (err) {
      console.error(err);
      if (err.message === 'Invalid file type.') {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw { message: `Invalid file ${files[i]?.fileName}`, file: files[i]?.fileName };
      }
      if (err && err.message !== 'Invalid keystore file password.') {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw { message: err.message, file: files[i]?.fileName };
      }
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw ({ message: `Invalid keystore file password (${files[i].fileName}) - only files with the same password are supported. You can always upload the rest later on.`, file: files[i].fileName });
    }
  }
  return keyStores;
};

const readAllFiles = async (AllFiles: File[]) => {
  return await Promise.all(AllFiles.map(async (file: File) => {
    return await handleFileChosen(file);
  }));
};

const handleFileChosen = async (file: File) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file.path, 'utf8', (err: any | null, data: string) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fileTextPlain: data, fileName: file.name });
      }
    });
  });
};
