import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import config from '~app/backend/common/config';
import Connection from '~app/backend/common/store-manager/connection';
import { Title, Paragraph } from '~app/components/Wizard/components/common';
import CustomButton from '~app/components/Wizard/components/Validators/SelectNetwork/CustomButton';
// @ts-ignore
import seedPhraseIcon from '../../../../../assets/images/seed-phrase-icon.svg';
// @ts-ignore
import keystoreFileIcon from '../../../../../assets/images/keystore-file-icon.svg';

const Wrapper = styled.div`
  width:650px;
`;

const ButtonsWrapper = styled.div`
  width:100%;
  display: flex;
  align-items: center;
`;

const SeedOrKeystore = (props: SeedOrKeystoreProps) => {
  const { setPage, setStep } = props;

  /**
   * Clicking on seed/seedless buttons
   * @param mode
   */
  const onClick = ({ mode }: { mode: string }) => {
    Connection.db().set(config.FLAGS.VALIDATORS_MODE.KEY, mode);
    switch (mode) {
      case config.FLAGS.VALIDATORS_MODE.SEED:
        setPage(config.WIZARD_PAGES.VALIDATOR.IMPORT_OR_GENERATE_SEED);
        break;
      case config.FLAGS.VALIDATORS_MODE.KEYSTORE:
        setPage(config.WIZARD_PAGES.VALIDATOR.SELECT_NETWORK);
        break;
    }
    setStep(config.WIZARD_STEPS.VALIDATOR_SETUP);
  };

  const imageWrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    backgroundColor: 'transparent',
    width: 80,
  };

  const imageStyle = {
    width: 25,
    height: 30,
    marginRight: 0,
    marginLeft: 'auto'
  };

  return (
    <Wrapper>
      <Title>Seed Phrase or Keystore File</Title>
      <Paragraph style={{ marginBottom: 10 }}>
        Create your validator key from a seed phrase or extract it from your keystore file.
        <br />
        Blox Staking supports both.
      </Paragraph>

      <ButtonsWrapper>
        <CustomButton
          title="Seed Phrase"
          image={seedPhraseIcon}
          imageWrapperStyle={imageWrapperStyle}
          imageStyle={imageStyle}
          width="250px"
          isDisabled={false}
          onClick={() => onClick({ mode: config.FLAGS.VALIDATORS_MODE.SEED })}
        />
        <CustomButton
          title="Keystore File"
          image={keystoreFileIcon}
          imageWrapperStyle={imageWrapperStyle}
          imageStyle={imageStyle}
          width="250px"
          style={{ marginLeft: 50 }}
          isDisabled={false}
          onClick={() => onClick({ mode: config.FLAGS.VALIDATORS_MODE.KEYSTORE })}
        />
      </ButtonsWrapper>
    </Wrapper>
  );
};

type SeedOrKeystoreProps = {
  page: number;
  setPage: (page: number) => void;
  step: number;
  setStep: (page: number) => void;
};

export default connect(null, null)(SeedOrKeystore);
