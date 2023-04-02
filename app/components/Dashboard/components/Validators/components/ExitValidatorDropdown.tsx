import React, { useState } from 'react';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import styled from 'styled-components';
import useRouting from '~app/common/hooks/useRouting';
import { Icon, DropDown } from '~app/common/components';

const Wrapper = styled.div`
  position: relative;
`;

interface ExitValidatorProps {
  validator: Record<string, any>
}

const ExitValidatorDropdown = ({ validator }: ExitValidatorProps) => {
  const [isMenuOpen, toggleMenuDisplay] = useState(false);
  const { goToPage, ROUTES } = useRouting();
  const onClick = () => toggleMenuDisplay(!isMenuOpen);

  const menuItems = [
    {
      name: 'Exit Validator',
      onClick: () => {
        goToPage(ROUTES.EXIT_VALIDATOR);
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
