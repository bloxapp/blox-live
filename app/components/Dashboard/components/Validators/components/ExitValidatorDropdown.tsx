import React, { useState } from 'react';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import styled from 'styled-components';
import { Icon, DropDown } from 'common/components';

const Wrapper = styled.div`
  position: relative;
`;

interface ExitValidatorProps {
  validator: Record<string, any>
}

const ExitValidatorDropdown = ({ validator }: ExitValidatorProps) => {
  const [isMenuOpen, toggleMenuDisplay] = useState(false);
  const onClick = () => toggleMenuDisplay(!isMenuOpen);

  const menuItems = [
    {
      name: 'Exit Validator',
      onClick: () => {
        // TODO: navigate to exit validator screen
        console.log('Exit Validator clicked: ', validator);
      },
      color: false
    },
  ];

  // Don't show dropdown for accounts which didn't go through bls to execution process or not active
  if (!String(validator.withdrawalKey).startsWith('0x01') || validator.status !== 'active') {
    return null;
  }

  return (
    <ClickAwayListener onClickAway={() => toggleMenuDisplay(false)}>
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
  );
};

export default ExitValidatorDropdown;
