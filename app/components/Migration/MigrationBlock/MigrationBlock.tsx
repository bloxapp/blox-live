import React, {useState} from 'react';
import styled from 'styled-components';
import Checkbox from '~app/common/components/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckCircle from '@material-ui/icons/CheckCircle';
import {MigrationStepNumber} from '~app/components/Migration/styles';

const Wrapper = styled.div`
  width: 252px;
  height: 244px;
  flex-shrink: 0;
  border-radius: 12px;
  background: var(--gray-1, #F4F7FA);
  padding: 16px;
  margin-top: 24px;
`;

const Title = styled.div`
  color:  #0792E8;
  font-feature-settings: 'clig' off, 'liga' off;
  font-size: 14px;
  font-style: normal;
  font-weight: 800;
  line-height: 162%;
  margin-bottom: 8px;
`;

const Text = styled.div`
  color: #34455A;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 162%;
`;

const CustomLink = styled.p`
  color: #1BA5F8;
  font-feature-settings: 'clig' off, 'liga' off;
  font-family: Avenir;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 162%;
  text-decoration-line: underline;
  margin-top: 23px;
  cursor: pointer;
`;

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  color: #4CAF50;  // Green color for the success icon
`;

const MigrationBlock = ({
  title,
  text,
  checkboxText,
  link,
  isChecked,
  onChangeHandler,
  checkboxId,
  stepNumber,
  status,
}: {
  title: string,
  text: string,
  checkboxText?: string,
  link?: string,
  isChecked?: boolean,
  onChangeHandler?: Function,
  checkboxId?: number,
  stepNumber?: number,
  status?: 'notStarted' | 'inProgress' | 'completed';
}) => {
  const [checked, setChecked] = useState(isChecked);

  const checkboxHandler = () => {
    const result = !checked;
    setChecked(result);
    onChangeHandler(checkboxId, result);
  };

  return (
    <Wrapper>
      {stepNumber && <MigrationStepNumber>{stepNumber}</MigrationStepNumber>}
      <SpinnerContainer>
        {status === 'inProgress' && (
          <CircularProgress size={24} style={{ marginRight: '8px' }} />
        )}
        {status === 'completed' && (
          <CheckCircle style={{ marginRight: '8px' }} />
        )}
        {status === 'notStarted' && (
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: '2px solid #D3D3D3',
            marginRight: '8px'
          }} />
        )}
        <Title>{title}</Title>
      </SpinnerContainer>
      <Text>
        {text}
        {link && <CustomLink>{link}</CustomLink>}
      </Text>
      {checkboxText && <Checkbox checkboxStyle={{marginRight: 8}} checked={checked} onClick={checkboxHandler}>{checkboxText}</Checkbox>}
    </Wrapper>
  );
};

export default MigrationBlock;
