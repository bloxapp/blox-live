import React from 'react';
import styled from 'styled-components';
import Lottie from 'lottie-web-react';

import animationData from 'assets/animations/confetti.json';

const Wrapper = styled.div`
  position: fixed;
  top: -65px;
  z-index: 2;
  width: 100%;
`;

const defaultOptions = {
  name: 'confetti',
  loop: true,
  autoplay: true,
  animationData,
  rendererSettings: { preserveAspectRatio: 'xMidYMid slice' },
};

const confettiArray = [{ speed: 0.5 }, { speed: 0.6 }, { speed: 0.7 }];

const Confetti = () => {
  return (
    <>
      {confettiArray.map((confetti, index) => (
        <Wrapper key={index}>
          <Lottie
            options={defaultOptions}
            playingState="play"
            speed={confetti.speed}
          />
        </Wrapper>
      ))}
    </>
  );
};

export default Confetti;
