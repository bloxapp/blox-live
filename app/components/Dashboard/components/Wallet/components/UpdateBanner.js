import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Icon from '~app/common/components/Icon';
import { openExternalLink } from '~app/components/common/service';
import Rocket from '../../../assets/rocket.svg';

const EmptyWrapper = styled.div``;

const Wrapper = styled.div`
  width: 82%;
  height: 84px;
  display: flex;
  align-items: center;
  background-color: #FFFFFF;
  font-size: 14px;
  font-weight: 900;
  border-radius: 8px;
  margin-left: 100px;
  margin-bottom: 36px;
  border: 1px solid ${({theme}) => theme.gray300};
`;

const Image = styled.img`
  width: 100px;
  margin-right: 20px;
`;

const TextWrapper = styled.div`
  width: 100%;
`;
const Title = styled.div`
  height: 100%;
  font-size: 14px;
  font-weight: 500;
  color: ${({theme}) => theme.gray800};
`;

const Description = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: ${({theme}) => theme.gray600};
`;

const ButtonWrapper = styled.div`
  width: 20%;
  height: 100%;
  display: flex;
  align-items: center;
  text-align: center;
  cursor: pointer;
  :hover {
    color: ${({theme, color}) => (color && theme.primary700) || '#ffffff'};
  }
  :active {
    color: ${({theme, color}) => (color && theme.primary800) || '#ffffff'};
  }
`;

const Button = styled.div`
  font-size: 14px;
  color: ${({theme}) => theme.primary900};
`;

const UpdateBanner = (props) => {
  const {isNeedUpdate} = props;
  return isNeedUpdate ? (
    <Wrapper>
      <Image src={Rocket} />
      <TextWrapper>
        <Title>
          Version Update Required
        </Title>
        <Description>
          Please update Blox Live to the latest app version for optimal staking experience.
        </Description>
      </TextWrapper>
      <ButtonWrapper onClick={() => openExternalLink('download')}>
        <Button>
          Update Now
        </Button>
        <Icon
          name={'chevron-right'}
          color={'primary900'}
          fontSize="15px"
        />
      </ButtonWrapper>
    </Wrapper>
  ) : (
    <EmptyWrapper />
  );
};

UpdateBanner.propTypes = {
  isNeedUpdate: PropTypes.bool,
};

export default UpdateBanner;
