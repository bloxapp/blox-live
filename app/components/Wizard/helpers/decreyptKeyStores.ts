import * as fs from 'fs';
import EthereumKeyStore from 'eth2-keystore-js';

export const extractKeyStores = async (keyStoresFiles, password, callBack) => {

  const files = await readAllFiles(keyStoresFiles);
  const keyStores = [];
  for (const i in files) {
    try {
      const keyStore = new EthereumKeyStore(files[i].fileTextPlain);
      callBack(i);
      keyStores.push({
        fileName: files[i].fileName,
        privateKey: await keyStore.getPrivateKey(password),
        publicKey: keyStore.getPublicKey(),
        deposited: null
      });
      // eslint-disable-next-line no-await-in-loop
    } catch (err) {
      throw Error(`Invalid keystore file password for ${files[i].fileName}`);
    }
  }
  return keyStores;
};

const readAllFiles = async (AllFiles) => {
  const results = await Promise.all(AllFiles.map(async (file) => {
    const fileContents = await handleFileChosen(file);
    return fileContents;
  }));
  return results;
};

const handleFileChosen = async (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file.path, 'utf8', (err: any | null, data: string) => {
      if (err) {
        reject(err);
      } else {
        resolve({fileTextPlain: data, fileName: file.name});
      }
    });
  });
};
