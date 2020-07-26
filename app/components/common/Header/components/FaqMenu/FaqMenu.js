import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { DropDown } from '../../../../../common/components';
import Button from './Button';

const Wrapper = styled.div`
  position: relative;
`;

const AlertDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.warning900};
  position: absolute;
  top: -1px;
  right: -1px;
`;

const menuItems = [
  { name: "What's New?", onClick: () => false, color: true },
  { name: 'Documentation', onClick: () => false, color: false },
];

const FaqMenu = forwardRef(({ isOpen, onClick, showOrangeDot }, ref) => (
  <Wrapper ref={ref}>
    {showOrangeDot && <AlertDot />}
    <Button
      isOpen={isOpen}
      className="icon-help"
      onClick={() => onClick(!isOpen)}
    />
    {isOpen && <DropDown items={menuItems} />}
  </Wrapper>
));

FaqMenu.propTypes = {
  isOpen: PropTypes.bool,
  onClick: PropTypes.func,
  showOrangeDot: PropTypes.bool,
};

export default FaqMenu;
