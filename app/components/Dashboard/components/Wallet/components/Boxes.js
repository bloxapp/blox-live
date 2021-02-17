import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Box from './Box';
import { getBoxes } from './service';
import BoxWithPopper from './BoxWithPopper';

const Wrapper = styled.div`
  width: 100%;
  height: 168px;
  display: flex;
  justify-content: space-between;
`;

const Boxes = (props) => {
  const { isActive, summary, walletVersion } = props;
  const boxes = getBoxes(isActive, summary);
  return (
    <Wrapper>
      {boxes.map((box, index) => {
        const { name, width, color, bigText, medText, tinyText } = box;
        if (index === boxes.length - 1) {
          const textWithVersion = `${tinyText} Version ${walletVersion}`;
          return (<BoxWithPopper {...box} key={index} tinyText={textWithVersion} {...props} />);
        }
        return (
          <Box key={`box${index}`} name={name} width={width} color={color}
            bigText={bigText} medText={medText} tinyText={tinyText}
          />
        );
      })}
    </Wrapper>
  );
};

Boxes.propTypes = {
  isActive: PropTypes.bool,
  summary: PropTypes.object,
  walletVersion: PropTypes.string
};

export default Boxes;
