import React, { useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { ClickAwayListener } from '@material-ui/core';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import HeaderLink from '~app/components/common/Header/HeaderLink';
import { getWizardFinishedStatus } from '~app/components/Wizard/selectors';
import { logout } from '~app/components/Login/components/CallbackPage/actions';
import { FaqMenu, ProfileMenu } from '~app/components/common/Header/components';
import { getUserData } from '~app/components/Login/components/CallbackPage/selectors';
// @ts-ignore
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

const Header = (props: Props) => {
  const { withMenu, profile, logoutUser, hideProfileMenu } = props;
  const [isProfileMenuOpen, toggleProfileMenuOpenDisplay] = useState(false);
  const [isHelpMenuOpen, toggleHelpMenuOpenDisplay] = useState(false);
  const hideTopNav = true;

  const handleProfileClickAway = () => {
    toggleProfileMenuOpenDisplay(false);
  };

  const handleHelpClickAway = () => {
    toggleHelpMenuOpenDisplay(false);
  };

  const onLogoutUserClick = () => {
    logoutUser();
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
        <ClickAwayListener onClickAway={handleHelpClickAway}>
          <FaqMenu
            isOpen={isHelpMenuOpen}
            onClick={toggleHelpMenuOpenDisplay}
          />
        </ClickAwayListener>
        {!hideProfileMenu && profile && (
          <ClickAwayListener onClickAway={handleProfileClickAway}>
            <ProfileMenu
              profile={profile}
              isOpen={isProfileMenuOpen}
              toggleOpen={toggleProfileMenuOpenDisplay}
              logout={onLogoutUserClick}
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
  hideProfileMenu?: boolean;
}

Header.defaultProps = {
  hideProfileMenu: false
};

const mapStateToProps = (state) => ({
  profile: getUserData(state),
  isFinishedWizard: getWizardFinishedStatus(state),
});

const mapDispatchToProps = (dispatch) => ({
  logoutUser: () => dispatch(logout())
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Header));
