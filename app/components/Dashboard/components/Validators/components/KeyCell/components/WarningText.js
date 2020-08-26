import styled from 'styled-components';

const WarningText = styled.span`
  height:20px;
  color: ${({ theme }) => theme.warning900};
  font-size: 12px;
  font-weight: 500;
`;

export default WarningText;
