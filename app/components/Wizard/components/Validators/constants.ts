import config from '~app/backend/common/config';
// @ts-ignore
import testNetImage from '../../assets/img-validator-test-net.svg';
// @ts-ignore
import mainNetImage from '../../assets/img-validator-main-net.svg';

export const NETWORKS = {
  prater: {
    chainId: 5,
    name: 'Prater',
    title: 'Test on Prater',
    image: testNetImage,
    label: config.env.PRATER_NETWORK,
  },
  mainnet: {
    chainId: 1,
    name: 'Mainnet',
    title: 'Stake on Mainnet',
    image: mainNetImage,
    label: config.env.MAINNET_NETWORK,
  },
};

export const INTRO_TOOLTIP_TEXT = `GoETH are test tokens needed in order to participate in the Goerli Test Network.
  'You need at least 32 GoETH test tokens in order to stake on ${NETWORKS.prater.name}. GoETH have no real value!`;
