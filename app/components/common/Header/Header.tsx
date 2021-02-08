import React, { useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { ClickAwayListener } from '@material-ui/core';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import HeaderLink from './HeaderLink';
import { ProfileMenu } from './components';
import { logout } from '../../CallbackPage/actions';
import { getUserData } from '../../CallbackPage/selectors';
import { getWizardFinishedStatus } from '../../Wizard/selectors';
import AddValidatorButtonWrapper from './components/AddValidatorButtonWrapper';

import imageSrc from 'assets/images/staking-logo.svg';

const Wrapper = styled.div`
  width: 100%;
  height: 70px;
  padding: 0 7.5vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.primary900};
  background-size: cover;
  background-position: center;
  position: fixed;
  top: 0;
  z-index: 10;
`;

const Left = styled.div`
  width: 25%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const Center = styled.div`
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Logo = styled.img`
  width: 77px;
  height: 37px;
  margin-right: 65px;
`;

const Right = styled.div`
  width: 25%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const AddValidatorButton = styled.button`
  width:136px;
  height:32px;
  background-color:${({ theme }) => theme.primary700};
  color:${({ theme }) => theme.gray50};
  margin-right:20px;
  border:0;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size: 14px;
  font-weight: 900;
  border-radius:6px;
  cursor:pointer;
  &:hover {
    color:${({ theme }) => theme.accent2200};
  }
`;

const Header = (props: Props) => {
  const { withMenu, profile, logoutUser, location, isDashboard } = props;
  const [isProfileMenuOpen, toggleProfileMenuOpenDisplay] = useState(false);
  const showAddValidatorButton = location.pathname === '/' && isDashboard;
  const hideTopNav = true;

  const handleProfileClickAway = () => {
    toggleProfileMenuOpenDisplay(false);
  };

  return (
    <Wrapper>
      <Left> <Logo src={imageSrc} /> </Left>
      {withMenu && !hideTopNav && (
        <Center>
          <HeaderLink to="/" name="Dashboard" iconName="graph" />
          <HeaderLink to="/settings/general" name="Settings" iconName="settings" />
        </Center>
      )}
      <Right>
        {showAddValidatorButton && (
          <AddValidatorButtonWrapper>
            <AddValidatorButton>Add Validator</AddValidatorButton>
          </AddValidatorButtonWrapper>
        )}
        {profile && (
          <ClickAwayListener onClickAway={handleProfileClickAway}>
            <ProfileMenu
              profile={profile}
              isOpen={isProfileMenuOpen}
              toggleOpen={toggleProfileMenuOpenDisplay}
              logout={logoutUser}
            />
          </ClickAwayListener>
        )}
      </Right>
    </Wrapper>
  );
};

interface Props extends RouteComponentProps {
  withMenu: boolean;
  profile: Record<string, any>;
  logoutUser: () => void;
  isDashboard: boolean;
}

const mapStateToProps = (state) => ({
  profile: getUserData(state),
  isFinishedWizard: getWizardFinishedStatus(state),
});

const mapDispatchToProps = (dispatch) => ({
  logoutUser: () => dispatch(logout())
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Header));
