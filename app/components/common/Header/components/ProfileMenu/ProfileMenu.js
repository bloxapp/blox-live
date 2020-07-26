import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from './Button';
import LogoutButton from './LogoutButton';

const Wrapper = styled.div`
  position: relative;
  margin-left: 15px;
`;

const Menu = styled.div`
  width: 240px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #ffffff;
  position: absolute;
  top: 32px;
  right: 0px;
  box-shadow: 0px 2px 4px 0px ${({ theme }) => theme.gray80015};
  border-radius: 4px;
`;

const Image = styled.img`
  width: 26px;
  height: 26;
  border-radius: 50%;
`;

const MenuItem = styled.div`
  width: 100%;
  padding: 12px 0px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
`;

const Name = styled.span`
  color: ${({ theme }) => theme.gray800};
  padding: 4px 16px;
`;

const Email = styled.span`
  color: ${({ theme }) => theme.gray400};
  padding: 4px 16px;
`;

const Separator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.gray300};
`;

const ProfileMenu = forwardRef(
  ({ isOpen, toggleOpen, profile, logout }, ref) => (
    <Wrapper ref={ref}>
      <Button isOpen={isOpen} onClick={() => toggleOpen(!isOpen)}>
        <Image src={profile.picture} />
      </Button>
      {isOpen && (
        <Menu>
          <MenuItem>
            <Name>{profile.name}</Name>
            <Email>{profile.email}</Email>
          </MenuItem>
          <Separator />
          <MenuItem>
            <LogoutButton onClick={logout}>Log Out</LogoutButton>
          </MenuItem>
        </Menu>
      )}
    </Wrapper>
  )
);

ProfileMenu.propTypes = {
  isOpen: PropTypes.bool,
  toggleOpen: PropTypes.func,
  profile: PropTypes.object,
  logout: PropTypes.func,
};

export default ProfileMenu;
