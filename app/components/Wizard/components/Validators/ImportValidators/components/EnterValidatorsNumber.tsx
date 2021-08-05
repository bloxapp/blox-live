import React, { useEffect, useState } from 'react';
import styled from 'styled-components/dist/styled-components.esm';
import { ArrowButton } from '~app/common/components';
import BloxTooltip from '~app/common/components/Tooltip';
import Connection from '~app/backend/common/store-manager/connection';
import { Paragraph, Warning } from '~app/components/Wizard/components/common';
import KeyManagerService from '~app/backend/services/key-manager/key-manager.service';
import { getNetworkForImport } from '~app/components/Wizard/components/Validators/ImportValidators/components/helpers';
import InfoImage from '../../../../../../assets/images/info.svg';

const Image = styled.img`
  width: 16px;
  height: 16px;
  margin: 0 6px 2px 2px;
`;

const Question = styled.div`
  font-size: 18px;
  color: ${({ theme }) => theme.gray800};
  margin-bottom: 15px;
`;

const TextField = styled.input<{ error: string }>`
  height: 40px;
  color:${({theme, disabled}) => disabled ? theme.gray400 : theme.gray600};
  font-size: 14px;
  width: 182px;
  font-weight: 500;
  border-radius: 4px;
  border: solid 1px ${({theme, error}) => error ? theme.destructive600 : theme.gray300};
  padding:8px 32px 8px 12px;
  outline: none;
  &:focus {
    border: solid 1px ${({theme, error}) => error ? theme.destructive600 : theme.primary900};
  }
`;

const ErrorMessage = styled.span`
  font-size: 12px;
  font-weight: 900;
  line-height: 1.67;
  color: ${({theme}) => theme.destructive600};
`;

type EnterValidatorsNumberProps = {
  show: boolean,
  setValidators: (validators: any[]) => void
};

/**
 * Select number of validators to be imported
 *
 * @param show
 * @param setValidatorsNumber
 * @constructor
 */
const EnterValidatorsNumber = ({ show, setValidators }: EnterValidatorsNumberProps) => {
  if (!show) {
    return null;
  }

  const [validatorsNumber, setValidatorsNumber] = useState(0);
  const [generatedValidators, setGeneratedValidators] = useState([]);
  const [validatorsNumberError, setValidatorsNumberError] = useState('');
  const [confirmedValidatorsNumber, confirmValidatorsNumber] = useState(false);
  const [validatorsNumberButtonDisabled, setValidatorsNumberButtonDisabled] = useState(true);
  const validatorsMaximumLimit = 500;

  useEffect(() => {
    // Confirm validators number button
    setValidatorsNumberButtonDisabled(!(!validatorsNumberError && validatorsNumber > 0 && validatorsNumber <= validatorsMaximumLimit));

    // Error about entered validators number
    if (validatorsNumber > validatorsMaximumLimit) {
      setValidatorsNumberError(`Import is limited to ${validatorsMaximumLimit} validators`);
    } else {
      setValidatorsNumberError('');
    }

    // When validators generated - pass them into the upper component using setter
    if (generatedValidators) {
      setValidators(generatedValidators);
    }
  }, [validatorsNumber, validatorsNumberError, confirmedValidatorsNumber, generatedValidators]);

  const onValidatorsNumberInput = (event) => {
    event.persist();
    try {
      setValidatorsNumber(Math.abs(parseInt(event.target.value, 10)));
    } catch (e) {
      setValidatorsNumber(0);
    }
  };

  /**
   * User confirmed validators number - now we've to generate them in CLI
   */
  const onValidatorsNumberButtonClick = async () => {
    await (!validatorsNumberError && confirmValidatorsNumber(true));
    await generateValidators();
  };

  /**
   * Generating validators
   */
  const generateValidators = async () => {
    const seed = Connection.db().get('seed');
    const network = getNetworkForImport();

    const keyManagerService = new KeyManagerService();
    let validators = await keyManagerService.getAccount(seed, validatorsNumber - 1, network, true);
    if (validators && validators.length) {
      validators = validators.reverse();
      setGeneratedValidators(validators);
    }
  };

  const warningStyle = {
    marginBottom: 34,
    maxWidth: 590,
    width: 590,
    paddingRight: 5
  };

  return (
    <>
      <Warning style={warningStyle} text={'In order to avoid slashing, make sure to stop attesting with different providers before importing.'} />
      <Paragraph>
        All validators created or imported during our ‘early bird’ promotion will not be charged until phase 1.5.
        <BloxTooltip title="All validators created or imported during this promotion period will not pay service fees until Phase 1.5 when transfers are enabled, or for up to 2 years, whichever happens first." arrow>
          <Image src={InfoImage} />
        </BloxTooltip>
      </Paragraph>
      <Paragraph>
        Validators will be imported in chronological order, according to their <br /> creation date.
        <BloxTooltip title="Ex: if you have a total of 6 validators and would like to transfer 4, the first 4 validators that you created will be the ones imported." arrow>
          <Image src={InfoImage} />
        </BloxTooltip>
      </Paragraph>

      <Question>How many Validators would you like to import?</Question>

      <Paragraph>
        <TextField
          id="validators-number"
          type="text"
          value={validatorsNumber || ''}
          placeholder={'# of validator(s)'}
          onChange={onValidatorsNumberInput}
          onPaste={onValidatorsNumberInput}
          error={validatorsNumberError}
          autoFocus
        />
        <ArrowButton
          disabled={validatorsNumberButtonDisabled}
          onClick={onValidatorsNumberButtonClick}
        />
        <br />
        {validatorsNumberError && <ErrorMessage>{validatorsNumberError}</ErrorMessage>}
      </Paragraph>
    </>
  );
};

export default EnterValidatorsNumber;
