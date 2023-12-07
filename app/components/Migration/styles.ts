import styled from 'styled-components';

export const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.gray50};
  display: flex;
  flex-direction: column;
  padding: 40px 258px 64px 258px;
`;

export const MigrationStepNumber = styled.div`
  display: flex;
  width: 20px;
  height: 20px;
  padding: 2px;
  justify-content: center;
  margin-bottom: 8px;
  align-items: center;
  border-radius: 6px;
  border: 2px solid #1BA5F8;
  background: #FFF;
`;

export const Title = styled.h1`
  margin: 0;
  color: var(--gray-7, #0B2A3C);
  font-variant-numeric: ordinal;
  font-feature-settings: 'clig' off, 'liga' off;
  font-family: Avenir;
  font-size: 26px;
  font-style: normal;
  font-weight: 800;
  line-height: 44px;
`;

export const Layout = styled.div`
  width: 844px;
  flex-direction: column;
  padding: 32px;
  border-radius: 16px;
  background: #FDFEFE;
`;

export const AdditionalText = styled.p`
  color: #34455A;
  font-feature-settings: 'clig' off, 'liga' off;
  font-family: Avenir;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 162%;
`;
