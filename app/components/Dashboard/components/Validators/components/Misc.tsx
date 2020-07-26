import React, { useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { ClickAwayListener } from '@material-ui/core';
import { Icon, DropDown, Modal } from '../../../../../common/components';
import { useInjectSaga } from '../../../../../utils/injectSaga';

import { deleteAccount } from '../../../../Accounts/actions';
import saga from '../../../../Accounts/saga';

const Wrapper = styled.div`
  position: relative;
`;

const key = 'accounts';

const Misc = (props: Props) => {
  useInjectSaga({ key, saga, mode: '' });
  const { accountId, callDeleteAccount } = props;
  const [isMenuOpen, toggleMenuDisplay] = useState(false);
  const [isDeleteModalOpen, toggleDeleteModalDisplay] = useState(false);
  const [isWalletModalOpen, toggleWalletModalDisplay] = useState(false);

  const onClick = () => toggleMenuDisplay(!isMenuOpen);

  const onClickAway = () => toggleMenuDisplay(false);

  const menuItems = [
    {
      name: 'Delete',
      onClick: () => toggleDeleteModalDisplay(true),
      color: null,
    },
    {
      name: 'Associated wallet',
      onClick: () => toggleWalletModalDisplay(true),
      color: null,
    },
  ];

  const onDeleteValidatorClick = () => {
    callDeleteAccount(accountId);
    toggleDeleteModalDisplay(false);
  };

  const onAssociatedWalletClick = () => {
    toggleWalletModalDisplay(false);
  };

  return (
    <>
      <ClickAwayListener onClickAway={onClickAway}>
        <Wrapper onClick={onClick}>
          <Icon
            name="more-vert"
            fontSize="16px"
            color="gray800"
            onClick={() => false}
          />
          {isMenuOpen && <DropDown items={menuItems} />}
        </Wrapper>
      </ClickAwayListener>
      {isDeleteModalOpen && (
        <Modal
          title="Delete Validator"
          buttonText="Delete"
          buttonColor="destructive600"
          text="Are you sure you want to delete this validator?"
          onClick={onDeleteValidatorClick}
          onCloseClick={() => toggleDeleteModalDisplay(false)}
        />
      )}
      {isWalletModalOpen && (
        <Modal
          title="Associated wallet"
          buttonText="Copy Address"
          buttonColor="primary900"
          text="fjfhjdasfsdfdfdsjf sdhf dskjfdshf sahfjksdfhjdsfhdshfkjhdf jhd fjdksfhjkd fhdjf hdk fhd fhdsaf"
          onClick={onAssociatedWalletClick}
          onCloseClick={() => toggleWalletModalDisplay(false)}
        />
      )}
    </>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  callDeleteAccount: (accountId: number) => dispatch(deleteAccount(accountId)),
});

type Props = {
  accountId: number;
  callDeleteAccount: (publicKey: number) => void;
};

type Dispatch = (arg0: { type: string }) => any;

export default connect(null, mapDispatchToProps)(Misc);
