import React, { forwardRef } from 'react';
import { shell } from 'electron';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import config from '~app/backend/common/config';
import { DropDown } from '~app/common/components';
import Button from './Button';

const Wrapper = styled.div`
  position: relative;
`;

const AlertDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.warning900};
  position: absolute;
  top: -1px;
  right: -1px;
`;

const FaqMenu = forwardRef(({ isOpen, onClick, showOrangeDot }, ref) => {
  const menuItems = [
    {
      name: 'Contact us',
      onClick: () => {
        onClick(false);
        return shell.openExternal(config.env.CONTACT_US_LINK);
      },
      color: false
    },
    {
      name: 'Knowledge Base',
      onClick: () => {
        onClick(false);
        return shell.openExternal(config.env.KNOWLEDGE_BASE_LINK);
      },
      color: false
    },
    {
      name: 'Send Feedback',
      onClick: () => {
        onClick(false);
        return shell.openExternal(config.env.SEND_FEEDBACK_LINK);
      },
      color: false
    }
  ];

  return (
    <Wrapper ref={ref}>
      {showOrangeDot && <AlertDot />}
      <Button
        isOpen={isOpen}
        className="icon-help"
        onClick={() => onClick(!isOpen)}
      />
      {isOpen && <DropDown items={menuItems} />}
    </Wrapper>
  );
});

FaqMenu.propTypes = {
  isOpen: PropTypes.bool,
  onClick: PropTypes.func,
  showOrangeDot: PropTypes.bool,
};

export default FaqMenu;
