import React, { useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import useRouting from '~app/common/hooks/useRouting';
import { Icon, DropDown } from '~app/common/components';
import { setWizardPageData } from '~app/components/Wizard/actions';

const Wrapper = styled.div`
  position: relative;
`;

interface ExitValidatorProps {
  validator: Record<string, any>,
  setPageData: Function,
}

const ExitValidatorDropdown = ({ validator, setPageData }: ExitValidatorProps) => {
  const [isMenuOpen, toggleMenuDisplay] = useState(false);
  const { goToPage, ROUTES } = useRouting();
  const onClick = () => toggleMenuDisplay(!isMenuOpen);

  const menuItems = [
    {
      name: 'Exit Validator',
      onClick: () => {
        setPageData(validator);
        goToPage(ROUTES.EXIT_VALIDATOR);
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

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setPageData: (data: any) => dispatch(setWizardPageData(data))
});

type Dispatch = (arg0: { type: string }) => any;

export default connect(null, mapDispatchToProps)(ExitValidatorDropdown);
