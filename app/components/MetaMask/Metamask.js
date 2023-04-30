// import Web3 from 'web3';
// import { EVENTS } from './constants';

// const depositContractABI = require('./deposit_tx2.json');

// const depositTo = '0x0F0F0fc0530007361933EaB5DB97d09aCDD6C1c8';

// import Web3 from "web3";
// import config from "../../backend/common/config";

// const web3 = new Web3(config.env.DEFAULT_WEB3_HTTP_PROVIDER);
// const depositContract = new web3.eth.Contract(depositContractABI, depositTo);

// export default class MetaMask {
//   constructor() {
//     this.metaMask = window.ethereum;
//   }

//   isExist = () =>
//     typeof this.metaMask !== 'undefined' && this.metaMask.isMetaMask;

//   enableAccounts = async () => {
//     const accounts = await this.metaMask.enable();
//     this.accounts = accounts;
//     return accounts;
//   };

//   sendEthersTo = ({ amount, ...depositData }, accounts) =>
//     new Promise((resolve, reject) => {
//       const { selectedAddress, networkVersion } = this.metaMask;
//       const {
//         publicKey,
//         withdrawalCredentials,
//         signature,
//         depositDataRoot,
//       } = depositData;

//       if (networkVersion !== '5') {
//         reject(
//           new Error('Please choose Goerli network in Metamask before deposit')
//         );
//         return;
//       }

//       const method = 'eth_sendTransaction';

//       const depositMethod = depositContract.methods.deposit(
//         `0x${publicKey}`,
//         `0x${withdrawalCredentials}`,
//         `0x${signature}`,
//         `0x${depositDataRoot}`
//       );

//       const data = depositMethod.encodeABI();
//       const from = selectedAddress || accounts[0];

//       const params = [
//         {
//           from,
//           to: depositTo,
//           gas: '0x61A80', // 0.01
//           gasPrice: '5208', // 0.01
//           value: web3.utils.numberToHex(web3.utils.toWei('32', 'ether')), // (amount * 1000000).toString(), // '32000000000'
//           data,
//         },
//       ];

//       const configObject = { method, params, from };
//       return this.metaMask.sendAsync(configObject, (error, response) => {
//         if (error) {
//           reject(error);
//         }
//         console.log('response', response);
//         resolve(response.result);
//       });
//     });

//   subscribeToChange = (eventName) => {
//     if (!EVENTS[eventName]) {
//       return;
//     }
//     this.metaMask.on(EVENTS[eventName], (data) => {
//       console.log(`data from subscribeToChange ${eventName}`, data);
//     });
//   };
// }
