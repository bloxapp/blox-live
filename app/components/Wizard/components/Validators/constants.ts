import config from '~app/backend/common/config';
import testNetImage from '../../assets/img-validator-test-net.svg';
import mainNetImage from '../../assets/img-validator-main-net.svg';

export const NETWORKS = {
  pyrmont: {
    chainId: 5,
    name: 'Pyrmont',
    title: 'Test on Pyrmont',
    image: testNetImage,
    label: config.env.PYRMONT_NETWORK,
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
  'You need at least 32 GoETH test tokens in order to stake on ${NETWORKS.pyrmont.name}. GoETH have no real value!`;
