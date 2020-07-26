import React from 'react';
import styled from 'styled-components';

import WelcomePage from '../WelcomePage';
import { Template } from '../common';
import * as WalletPages from '../Wallet';
import * as ValidatorPages from '../Validators';

import walletImage from 'components/Wizard/assets/img-key-vault.svg';
import validatorImage from 'components/Wizard/assets/img-validator-test-net.svg';

const Wrapper = styled.div`
  height: 100%;
  padding-top: 70px;
`;

const switcher = (props: Props) => {
  const { page } = props;
  switch (page) {
    case 0:
      return <WelcomePage key={0} {...props} />;
    case 1:
      return (
        <Template
          key={1}
          bgImage={walletImage}
          {...props}
          component={<WalletPages.PreRequirements {...props} />}
        />
      );
    case 2:
      return (
        <Template
          key={2}
          bgImage={walletImage}
          {...props}
          component={<WalletPages.KeyVaultPage {...props} />}
        />
      );
    case 3:
      return (
        <Template
          key={3}
          bgImage={walletImage}
          {...props}
          component={<WalletPages.CongratulationPage {...props} />}
        />
      );
    case 4:
      return (
        <Template
          key={4}
          bgImage=""
          {...props}
          component={<ValidatorPages.SelectNetwork {...props} />}
        />
      );
    case 5:
      return (
        <Template
          key={5}
          bgImage={validatorImage}
          {...props}
          component={<ValidatorPages.CreateValidator {...props} />}
        />
      );
    case 6:
      return (
        <Template
          key={6}
          bgImage={validatorImage}
          {...props}
          component={<ValidatorPages.ValidatorCreated {...props} />}
        />
      );
    case 7:
      return (
        <Template
          key={7}
          bgImage={validatorImage}
          {...props}
          component={<ValidatorPages.StakingDeposit {...props} />}
        />
      );
    case 8:
      return (
        <Template
          key={8}
          bgImage={validatorImage}
          {...props}
          component={<ValidatorPages.AlmostDone {...props} />}
        />
      );
    default:
      return <WelcomePage {...props} />;
  }
};

const ContentManager = (props: Props) => <Wrapper>{switcher(props)}</Wrapper>;

type Props = {
  page: number;
  setPage: (page: number) => void;
  step: number;
  setStep: (page: number) => void;
};

export default ContentManager;
