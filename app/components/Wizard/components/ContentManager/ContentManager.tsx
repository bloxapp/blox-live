import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import WelcomePage from '../WelcomePage';
import { Template } from '../common';
import * as WalletPages from '../Wallet';
import * as ValidatorPages from '../Validators';

import walletImage from 'components/Wizard/assets/img-key-vault.svg';
import testnetValidatorImage from '../../assets/img-validator-test-net.svg';
import mainnetValidatorImage from '../../assets/img-validator-main-net.svg';
import {getDepositToNetwork} from '../../../Accounts/selectors';

const Wrapper = styled.div`
  height: 100%;
  padding-top: 70px;
`;

const switcher = (props: Props) => {
  const { page, network } = props;
  const validatorImage = network === 'pyrmont' ? testnetValidatorImage : mainnetValidatorImage;

  switch (page) {
    case 0:
      return <WelcomePage {...props} />;
    case 1:
      return (
        <Template key={1} bgImage={walletImage} {...props}
          component={<WalletPages.CloudProvider {...props} />}
        />
      );
    case 2:
      return (
        <Template key={2} bgImage={walletImage} {...props}
          component={<WalletPages.CreateServer {...props} />}
        />
      );
    case 3:
      return (
        <Template key={3} bgImage={walletImage} {...props}
          component={<WalletPages.Passphrase {...props} />}
        />
      );
    case 4:
      return (
        <Template key={4} bgImage={walletImage} {...props}
          component={<WalletPages.CongratulationPage {...props} />}
        />
      );
    case 5:
      return (
        <Template key={5} bgImage="" {...props}
          component={<ValidatorPages.SelectNetwork {...props} />}
        />
      );
    case 6:
      return (
        <Template key={6} bgImage={validatorImage} {...props}
          component={<ValidatorPages.CreateValidator {...props} />}
        />
      );
    case 7:
      return (
        <Template key={7} bgImage={validatorImage} {...props}
          component={<ValidatorPages.StakingDeposit {...props} />}
        />
      );
    case 8:
      return (
        <Template key={8} bgImage={validatorImage} {...props}
          component={<ValidatorPages.CongratulationPage {...props} />}
        />
      );
    default:
      return <WelcomePage {...props} />;
  }
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
