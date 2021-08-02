import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import config from '~app/backend/common/config';
import { Template } from '~app/components/Wizard/components/common';
import * as WalletPages from '~app/components/Wizard/components/Wallet';
import { getDepositToNetwork } from '~app/components/Accounts/selectors';
import * as ValidatorPages from '~app/components/Wizard/components/Validators';
import WizardStartPage from '~app/components/Wizard/components/WizardStartPage';
import * as AccountSetupPages from '~app/components/Wizard/components/AccountSetup';
// @ts-ignore
import walletImage from 'components/Wizard/assets/img-key-vault.svg';
// @ts-ignore
import testnetValidatorImage from '../../assets/img-validator-test-net.svg';
// @ts-ignore
import mainnetValidatorImage from '../../assets/img-validator-main-net.svg';

const Wrapper = styled.div`
  height: 100%;
  padding-top: 70px;
`;

const switcher = (props: Props) => {
  const { page, network } = props;
  const validatorImage = network === config.env.PRATER_NETWORK ? testnetValidatorImage : mainnetValidatorImage;
  let component;
  let bgImage = '';

  switch (page) {
    case config.WIZARD_PAGES.WALLET.SELECT_CLOUD_PROVIDER:
      bgImage = walletImage;
      component = <WalletPages.CloudProvider {...props} />;
      break;

    case config.WIZARD_PAGES.WALLET.CREATE_SERVER:
      bgImage = walletImage;
      component = <WalletPages.CreateServer {...props} />;
      break;

    case config.WIZARD_PAGES.WALLET.CONGRATULATIONS:
      bgImage = walletImage;
      component = <WalletPages.CongratulationPage {...props} />;
      break;

    case config.WIZARD_PAGES.WALLET.IMPORT_OR_GENERATE_SEED:
      bgImage = '';
      component = <WalletPages.ImportOrGenerateSeed {...props} />;
      break;

    case config.WIZARD_PAGES.WALLET.SEED_OR_KEYSTORE:
      bgImage = '';
      component = <WalletPages.SeedOrKeystore {...props} />;
      break;

    case config.WIZARD_PAGES.ACCOUNT.SET_PASSWORD:
      bgImage = validatorImage;
      component = <AccountSetupPages.SetPassword {...props} />;
      break;

    case config.WIZARD_PAGES.WALLET.ENTER_MNEMONIC:
      bgImage = validatorImage;
      component = <WalletPages.Passphrase {...props} />;
      break;

    case config.WIZARD_PAGES.VALIDATOR.SELECT_NETWORK:
      component = <ValidatorPages.SelectNetwork {...props} />;
      break;

    case config.WIZARD_PAGES.VALIDATOR.UPLOAD_KEYSTORE_FILE:
      component = <ValidatorPages.UploadKeystoreFile {...props} />;
      break;

    case config.WIZARD_PAGES.VALIDATOR.VALIDATOR_SUMMARY:
      component = <ValidatorPages.ValidatorsSummary {...props} />;
      break;

    case config.WIZARD_PAGES.VALIDATOR.SLASHING_WARNING:
      component = <ValidatorPages.SlashingWarning {...props} />;
      break;

    case config.WIZARD_PAGES.VALIDATOR.DEPOSIT_OVERVIEW:
      component = <ValidatorPages.DepositOverview {...props} />;
      break;

    case config.WIZARD_PAGES.VALIDATOR.CREATE_VALIDATOR:
      bgImage = validatorImage;
      component = <ValidatorPages.CreateValidator {...props} />;
      break;

    case config.WIZARD_PAGES.VALIDATOR.STAKING_DEPOSIT:
      bgImage = validatorImage;
      component = <ValidatorPages.StakingDeposit {...props} />;
      break;

    case config.WIZARD_PAGES.VALIDATOR.CONGRATULATIONS:
      bgImage = validatorImage;
      component = <ValidatorPages.CongratulationPage {...props} />;
      break;

    case config.WIZARD_PAGES.WALLET.IMPORT_MNEMONIC:
      bgImage = validatorImage;
      component = <WalletPages.ImportPassphrase {...props} />;
      break;

    case config.WIZARD_PAGES.WALLET.IMPORT_VALIDATORS:
      bgImage = validatorImage;
      component = <WalletPages.ImportValidators {...props} />;
      break;
  }

  if (component && page !== config.WIZARD_PAGES.START_PAGE) {
    return (
      <Template
        key={page}
        bgImage={bgImage}
        {...props}
        component={component}
      />
    );
  }

  return <WizardStartPage {...props} />;
};

const ContentManager = (props: Props) => <Wrapper>{switcher(props)}</Wrapper>;

const mapStateToProps = (state: any) => ({
  network: getDepositToNetwork(state),
});

type Props = {
  page: number;
  pageData: any;
  setPage: (page: number) => void;
  setPageData: (data: any) => void;
  clearPageData: () => void;
  step: number;
  setStep: (page: number) => void;
  network: string;
  accounts: any;
};

export default connect(mapStateToProps)(ContentManager);
