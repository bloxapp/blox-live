import Connection from '~app/backend/common/store-manager/connection';

type Props = {
  isSeedless: boolean;
  decryptedKeyStores?: any;
  accounts?: any;
};

export function getInputData({isSeedless, decryptedKeyStores, accounts}:Props) {
  if (!isSeedless) {
    return Connection.db('').get('seed');
  }
  const inputData = {};
  for (let accountIndex = 0; accountIndex < accounts.length; accountIndex += 1) {
    const accountPublicKey = accounts[accountIndex].publicKey.substr(2);
    const accountNetwork = accounts[accountIndex].network;
    inputData[accountNetwork] = inputData[accountNetwork] || '';
    for (let keystoreIndex = 0; keystoreIndex < decryptedKeyStores.length; keystoreIndex += 1) {
      const keyStore = decryptedKeyStores[keystoreIndex];
      if (accountPublicKey === keyStore.publicKey && inputData[accountNetwork].indexOf(keyStore.privateKey) === -1) {
        console.debug('Should add keyStore.privateKey', keyStore.privateKey, 'to the network', accountNetwork);
        inputData[accountNetwork] = `${inputData[accountNetwork]},${keyStore.privateKey}`;
      }
    }
    inputData[accountNetwork] = inputData[accountNetwork].replace(/^[,]+/, '').replace(/[,]+$/, '');
  }
  return inputData;
}
