import * as fs from 'fs';
import EthereumKeyStore from 'eth2-keystore-js';

/**
 * Extract not extracted keystores using password
 * @param decryptedKeyStores
 * @param keyStoresFiles
 * @param password
 * @param callBack
 */
export const extractKeyStores = async (decryptedKeyStores: any[], keyStoresFiles: File[], password: string, callBack: any) => {
  const files = await readAllFiles(keyStoresFiles);
  const keyStores = [];
  // eslint-disable-next-line guard-for-in,no-restricted-syntax
  for (const i in files) {
    try {
      // @ts-ignore
      const keyStore = new EthereumKeyStore(files[i].fileTextPlain);
      const keyStorePublicKey = keyStore.getPublicKey();
      let keyStoreAlreadyDecrypted = false;
      for (let keyStoreIndex = 0; keyStoreIndex < decryptedKeyStores.length; keyStoreIndex += 1) {
        if (decryptedKeyStores[keyStoreIndex].publicKey === keyStorePublicKey) {
          keyStoreAlreadyDecrypted = true;
          break;
        }
      }
      if (!keyStoreAlreadyDecrypted) {
        keyStores.push({
          // @ts-ignore
          fileName: files[i].fileName,
          // eslint-disable-next-line no-await-in-loop
          privateKey: await keyStore.getPrivateKey(password),
          publicKey: keyStorePublicKey,
          deposited: null
        });
      }
      callBack(parseInt(i, 10) + 1);
    } catch (err) {
      console.error(err);
      // @ts-ignore
      throw Error(`Invalid keystore file password for ${files[i].fileName}`);
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
