import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import Auth from '~app/components/Auth';
import { SOCIAL_APPS } from '~app/common/constants';
import { useInjectSaga } from '~app/utils/injectSaga';
import { openExternalLink } from '~app/components/common/service';
import saga from '~app/components/Login/components/CallbackPage/saga';
import { BUTTONS_TEXTS } from '~app/components/Login/components/Right/constants';
import * as loginActions from '~app/components/Login/components/CallbackPage/actions';
import { getIsLoggedIn } from '~app/components/Login/components/CallbackPage/selectors';

const key = 'login';
const socialAppsList = Object.values(SOCIAL_APPS);

const Wrapper = styled.div`
  width: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
`;

const InnerWrapper = styled.div`
  width: 320px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Title = styled.h2`
  font-size: 26px;
  font-weight: 900;
  line-height: 1.69;
  letter-spacing: normal;
  color: ${(props) => props.theme.gray800};
  margin: 0 0 40px 0;
`;

const SmallText = styled.div`
  width: 257px;
  height: 16px;
  margin-bottom:8px;
  font-size: 11px;
  font-weight: 500;
  color: ${(props) => props.theme.gray600};
`;

const ButtonsWrapper = styled.div`
  width: 300px;
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SocialAppButton = styled.button`
  width: 85%;
  height: 40px;
  background-color: #ffffff;
  border-color: ${(props) => props.theme.gray400};
  border-width: 1px;
  border-style: solid;
  border-radius: 6px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  cursor: pointer;
  color: ${(props) => props.theme.gray600};
  &:hover {
    color: ${(props) => props.theme.gray400};
  }
  &:active {
    color: ${(props) => props.theme.gray800};
  }
`;

const SocialButtonIcon = styled.img`
  margin-right: 15px;
`;

const SocialButtonText = styled.div`
  height: 26px;
  display: flex;
  font-size: 16px;
  font-weight: 900;
  line-height: 1.75;
  text-align: center;
`;

const LinksWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.45;
  margin-top: 25px;
  color: ${(props) => props.theme.gray800};
`;

const Link = styled.a`
  text-decoration:underline;
  color: ${(props) => props.theme.gray600};
  &:hover {
    color: ${(props) => props.theme.gray400};
    text-decoration:underline;
  }
  &:active {
    color: ${(props) => props.theme.gray800};
    text-decoration:underline;
  }
`;

const AlreadyHaveWrapper = styled.div`
  width: 270px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.67;
  color: ${(props) => props.theme.gray800};
  margin-top: 70px;
`;

const AlreadyHaveLink = styled.a`
  font-size: 11px;
  font-weight: 900;
  line-height: 1.45;
  text-decoration: none;
  color: ${(props) => props.theme.primary600};
  &:hover {
    color: ${(props) => props.theme.primary400};
  }
  &:active {
    color: ${(props) => props.theme.primary800};
  }
`;

const Right = ({ actions }: Props) => {
  useInjectSaga({ key, saga, mode: '' });
  const [isSignUp, toggleSignUp] = useState(1);

  const onLoginClick = (lowerCaseLabel: string) => {
    Auth.events.emit(Auth.AUTH_EVENTS.LOGIN_BUTTON_CLICKED);
    setTimeout(() => {
      actions.login(lowerCaseLabel);
    }, 250);
  };

  return (
    <Wrapper>
      <InnerWrapper>
        <Title>Welcome to Blox Staking</Title>
        <SmallText>You will be directed to your web browser to log in</SmallText>
        <ButtonsWrapper>
          {socialAppsList.map((socialApp, index) => {
            const { label } = socialApp;
            const lowerCaseLabel = label.toLowerCase();
            const currentIcon = require(`components/Login/images/${lowerCaseLabel}-icon.png`);
            return (
              <SocialAppButton
                key={index}
                type="button"
                onClick={() => onLoginClick(lowerCaseLabel)}
              >
                <SocialButtonIcon src={currentIcon.default} />
                <SocialButtonText>
                  {BUTTONS_TEXTS[isSignUp].socialApp} {label}
                </SocialButtonText>
              </SocialAppButton>
            );
          })}
        </ButtonsWrapper>
        <LinksWrapper>
          By {BUTTONS_TEXTS[isSignUp].terms}, I agree to Blox’s &nbsp;
          <Link onClick={() => openExternalLink('privacy-policy')}>Privacy policy</Link>
          &nbsp; &amp; &nbsp;
          <Link onClick={() => openExternalLink('terms-of-use')}>Terms of use</Link>
        </LinksWrapper>
        <AlreadyHaveWrapper>
          {BUTTONS_TEXTS[isSignUp].account} &nbsp;
          <AlreadyHaveLink onClick={() => toggleSignUp(isSignUp === 0 ? 1 : 0)}>
            {BUTTONS_TEXTS[isSignUp].switcher} &gt;
          </AlreadyHaveLink>
        </AlreadyHaveWrapper>
      </InnerWrapper>
    </Wrapper>
  );
};

const mapStateToProps = (state: State) => ({
  isLoggedIn: getIsLoggedIn(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  actions: bindActionCreators(loginActions, dispatch),
});

type Props = {
  actions: Record<string, any>;
  isLoggedIn: boolean;
};

type State = Record<string, any>;
type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(Right);
