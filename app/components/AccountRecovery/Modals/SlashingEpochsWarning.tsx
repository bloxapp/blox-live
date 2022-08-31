import React, {useState} from 'react';
import {connect} from 'react-redux';
import {getAccounts} from '../../Accounts/selectors';
import {ModalTemplate, Button, Checkbox} from '~app/common/components';
import useCreateServer from '../../../common/hooks/useCreateServer';
import {getInputData} from '../../../utils/getInputDataForProccess';
import { Title, Description } from '~app/common/components/ModalTemplate/components';
import {getDecryptedKeyStores, getWalletSeedlessFlag} from '../../Wizard/selectors';

// @ts-ignore
import image from 'assets/images/img-recovery.svg';
import {bindActionCreators} from 'redux';
import * as actionsFromKeyvault from '../../KeyVaultManagement/actions';

const SlashingEpochsWarning = ({awsCreds, onClick, isSeedless, accounts, decryptedKeyStores, keyvaultActions}: Props) => {
  const [checked, setIsChecked] = useState(false);
  const { clearAwsKeysState } = keyvaultActions;
  const {onStartProcessClick } = useCreateServer({ onStart: () => onClick(), inputData: getInputData({isSeedless, accounts, decryptedKeyStores}) });

  const onNext = async () => {
    await onStartProcessClick('recovery', true, awsCreds.accessKeyId, awsCreds.secretAccessKey);
    clearAwsKeysState();
  };

  return (
    <ModalTemplate image={image}>
      <>
        <Title>Recovery Slashing Protection</Title>
        <Description>
          Please note that in order to mitigate potential slashing risk, <br />
          BloxLive will start to attest duties only 2 epochs after the <br />
          recovery process has completed
        </Description>
        <Checkbox checked={checked} onClick={setIsChecked} checkboxStyle={{marginBottom: 24, marginTop: 12, marginRight: 8}} labelStyle={{marginBottom: 24, marginTop: 9}}>
          I agree to the above measures and acknowledge that I will not receive potential gains for that period of time in which my validator will be inactive.
        </Checkbox>
        <Button isDisabled={!checked} onClick={onNext}>Continue</Button>
      </>
    </ModalTemplate>
  );
};

const mapStateToProps = (state) => ({
  accounts: getAccounts(state),
  isSeedless: getWalletSeedlessFlag(state),
  decryptedKeyStores: getDecryptedKeyStores(state),
});

const mapDispatchToProps = (dispatch) => ({
  keyvaultActions: bindActionCreators(actionsFromKeyvault, dispatch),
});

type Props = {
  awsCreds: any;
  onClick: () => void;
  accounts: Array<any>;
  isSeedless?: boolean;
  decryptedKeyStores: Array<any>;
  keyvaultActions: Record<string, any>;
};

export default connect(mapStateToProps, mapDispatchToProps)(SlashingEpochsWarning);
