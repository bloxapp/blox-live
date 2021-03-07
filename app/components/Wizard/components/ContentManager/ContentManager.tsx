import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import config from '~app/backend/common/config';
import { Template } from '~app/components/Wizard/components/common';
import WelcomePage from '~app/components/Wizard/components/WelcomePage';
import * as WalletPages from '~app/components/Wizard/components/Wallet';
import { getDepositToNetwork } from '~app/components/Accounts/selectors';
import * as ValidatorPages from '~app/components/Wizard/components/Validators';
import walletImage from 'components/Wizard/assets/img-key-vault.svg';
import testnetValidatorImage from '../../assets/img-validator-test-net.svg';
import mainnetValidatorImage from '../../assets/img-validator-main-net.svg';

const Wrapper = styled.div`
  height: 100%;
  padding-top: 70px;
`;

const switcher = (props: Props) => {
  const { page, network } = props;
  const validatorImage = network === config.env.PYRMONT_NETWORK ? testnetValidatorImage : mainnetValidatorImage;
  let component;
  let bgImage = '';

  switch (page) {
    case config.PAGES.WALLET.SELECT_CLOUD_PROVIDER:
      bgImage = walletImage;
      component = <WalletPages.CloudProvider {...props} />;
      break;

    case config.PAGES.WALLET.CREATE_SERVER:
      bgImage = walletImage;
      component = <WalletPages.CreateServer {...props} />;
      break;

    case config.PAGES.WALLET.CONGRATULATIONS:
      bgImage = walletImage;
      component = <WalletPages.CongratulationPage {...props} />;
      break;

    case config.PAGES.WALLET.IMPORT_OR_GENERATE_SEED:
      bgImage = validatorImage;
      component = <WalletPages.ImportOrGenerateSeed {...props} />;
      break;

    case config.PAGES.WALLET.ENTER_MNEMONIC:
      bgImage = validatorImage;
      component = <WalletPages.Passphrase {...props} />;
      break;

    case config.PAGES.VALIDATOR.SELECT_NETWORK:
      component = <ValidatorPages.SelectNetwork {...props} />;
      break;

    case config.PAGES.VALIDATOR.CREATE_VALIDATOR:
      bgImage = validatorImage;
      component = <ValidatorPages.CreateValidator {...props} />;
      break;

    case config.PAGES.VALIDATOR.STAKING_DEPOSIT:
      bgImage = validatorImage;
      component = <ValidatorPages.StakingDeposit {...props} />;
      break;

    case config.PAGES.VALIDATOR.CONGRATULATIONS:
      bgImage = validatorImage;
      component = <ValidatorPages.CongratulationPage {...props} />;
      break;

    case config.PAGES.WALLET.IMPORT_MNEMONIC:
      bgImage = validatorImage;
      component = <WalletPages.ImportPassphrase {...props} />;
      break;

    case config.PAGES.WALLET.IMPORT_VALIDATORS:
      bgImage = validatorImage;
      component = <WalletPages.ImportValidators {...props} />;
      break;
  }

  if (!component || page === config.PAGES.WELCOME.DEFAULT) {
    return <WelcomePage {...props} />;
  }

  return (
    <Template
      key={page}
      bgImage={bgImage}
      {...props}
      component={component}
    />
  );
};

const ContentManager = (props: Props) => <Wrapper>{switcher(props)}</Wrapper>;

const mapStateToProps = (state: any) => ({
  network: getDepositToNetwork(state),
});

type Props = {
  page: number;
  setPage: (page: number) => void;
  step: number;
  setStep: (page: number) => void;
  network: string;
};

export default connect(mapStateToProps)(ContentManager);
