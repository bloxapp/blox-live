import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import { SuccessIcon, Button, ModalTemplate } from '~app/common/components';
import { Title, Description, Wrapper } from '~app/common/components/ModalTemplate/components';
// @ts-ignore
import image from '../Wizard/assets/img-key-vault.svg';
import KeyVaultService from '../../backend/services/key-vault/key-vault.service';
import Connection from '../../backend/common/store-manager/connection';

const SuccessModal = ({ rewardAddressesData, onSuccess, title, text }) => {
  useEffect(() => {
    console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<beginning of the function>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log(rewardAddressesData);
    if (!rewardAddressesData) {
      return;
    }
    const keyVaultService = new KeyVaultService();
    Connection.db().set('network', rewardAddressesData.first.network);
    console.log(`set network to ${rewardAddressesData.first.network}`);
    keyVaultService.setListAccountsRewardKeys(rewardAddressesData.first).then((s: any) => {
      console.log(`got response ${s}`);
      console.log(`set network to ${rewardAddressesData.second.network}`);
      Connection.db().set('network', rewardAddressesData.second.network);
      keyVaultService.setListAccountsRewardKeys(rewardAddressesData.second).then((a: any) => {
        console.log(`got response ${a}`);
        console.log(`set network to ${rewardAddressesData.first.network}`);
        Connection.db().set('network', rewardAddressesData.first.network);
        console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<end of the function>>>>>>>>>>>>>>>>>>>>>>>>>>');
      });
    });
  }, []);

  return (
    <ModalTemplate onClose={onSuccess} image={image}>
      <Wrapper>
        <SuccessIcon size={'40px'} fontSize={'30px'} />
        <Title color={'accent2400'}>{title}</Title>
      </Wrapper>
      <Description>{text}</Description>
      <Button onClick={onSuccess}>Return to Dashboard</Button>
    </ModalTemplate>
  );
};

SuccessModal.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  onSuccess: PropTypes.func,
  rewardAddressesData: PropTypes.any
};

export default SuccessModal;
