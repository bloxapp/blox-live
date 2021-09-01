import { connect } from 'react-redux';
import styled from 'styled-components';
import {bindActionCreators} from 'redux';
import React, { useEffect, useState } from 'react';
import config from '~app/backend/common/config';
import Table from '~app/common/components/Table';
import { Checkbox } from '~app/common/components';
import ProcessLoader from '~app/common/components/ProcessLoader';
import { openExternalLink } from '~app/components/common/service';
import * as actionsFromWizard from '~app/components/Wizard/actions';
import { handlePageClick } from '~app/common/components/Table/service';
import BloxApi from '~app/backend/common/communication-manager/blox-api';
import {SmallText} from '~app/common/components/ModalTemplate/components';
import useProcessRunner from '~app/components/ProcessRunner/useProcessRunner';
import {getIdToken} from '~app/components/Login/components/CallbackPage/selectors';
import usePasswordHandler from '~app/components/PasswordHandler/usePasswordHandler';
import { getNetwork, getDecryptedKeyStores } from '~app/components/Wizard/selectors';
import tableColumns from '~app/components/Wizard/components/Validators/ValidatorsSummary/components/table-columns';
import { Title, Paragraph, Link, Warning, BackButton, ErrorMessage } from '~app/components/Wizard/components/common';

const Wrapper = styled.div`
  width:650px;
`;

const TableWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  font-family: Avenir, serif;
  font-size: 16px;
  font-weight: 500;
`;

const ButtonWrapper = styled.div`
  margin-top:41px;
  margin-bottom:41px;
`;

const Button = styled.button<{ isDisabled }>`
  border:0;
  width: 238px;
  height: 40px;
  display:flex;
  font-size: 14px;
  margin-top: 20px;
  font-weight: 900;
  align-items:center;
  border-radius: 6px;
  margin-bottom: 20px;
  justify-content:center;
  color:${({theme}) => theme.gray50};
  cursor:${({isDisabled}) => isDisabled ? 'default' : 'pointer'};
  background-color: ${({theme, isDisabled}) => isDisabled ? theme.gray400 : theme.primary900};
`;

const ProgressWrapper = styled.div`
  width:238px;
  margin-top:20px;
`;

const bloxApi = new BloxApi();
const ValidatorsSummary = (props: ValidatorsSummaryProps) => {
  const { checkIfPasswordIsNeeded } = usePasswordHandler();
  const { setPage, setStep, network, wizardActions, decryptedKeyStores } = props;
  const { clearDecryptKeyStores, clearDecryptProgress } = wizardActions;
  const [validators, setValidators] = useState(decryptedKeyStores);
  const [allDeposited, setAllDeposited] = useState(false);
  const [pagedValidators, setPagedValidators] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState(null);
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const [moveToDepositOverview, setMoveToDepositOverview] = useState(true);
  const [dontRunProcessAgain, setDontRunProcessAgain] = useState(false);
  const [isAgreementReadCheckbox, setAgreementReadCheckbox] = useState(false);
  const [isContinueButtonDisabled, setContinueButtonDisabled] = useState(false);
  const [isValidatorsOfflineCheckbox, setValidatorsOfflineCheckbox] = useState(false);
  const [allValidatorsHaveSameStatus, setAllValidatorsHaveSameStatus] = useState(true);
  const [displayDepositedConfirmation, setDisplayDepositedConfirmation] = useState(false);
  const { isLoading, isDone, processData, error, startProcess, processMessage, clearProcessState, loaderPercentage } = useProcessRunner();
  const checkboxStyle = { marginRight: 5 };
  const checkboxLabelStyle = { fontSize: 12 };
  const privacyPolicyLink = 'https://www.bloxstaking.com/privacy-policy/';
  const serviceAgreementLink = 'https://www.bloxstaking.com/license-agreement/';
  const PAGE_SIZE = 10;

  const notTheSameError = 'Only batches of the same status are supported (“deposited” / “not deposited”). Please go back and adjust your validators\' uploaded keystore files (you could upload the rest later on).';

  useEffect(() => {
    if (!isLoading && isDone && !error && processData) {
      setMoveToDepositOverview(true);
      setDontRunProcessAgain(true);
      if (moveToDepositOverview) setPage(config.WIZARD_PAGES.VALIDATOR.DEPOSIT_OVERVIEW);
    }
  }, [isLoading, isDone, error, processData]);

  const onPageClick = (offset) => {
    handlePageClick(validators, offset, setPagedValidators, setPaginationInfo, PAGE_SIZE);
  };

  const onLinkClick = (event: any, url: string) => {
    event.preventDefault();
    event.stopPropagation();
    return openExternalLink(url);
  };

  useEffect(() => {
    let notDepositedCount = 0;
    let depositedCount = 0;
    const publicKeys = [];
    validators.map((validator: any) => {
      if (validator.deposited) {
        depositedCount += 1;
      } else if (validator.deposited !== null) {
        notDepositedCount += 1;
      } else {
        publicKeys.push(validator.publicKey);
      }
      return validator;
    });

    setAllValidatorsHaveSameStatus(!(notDepositedCount > 0 && depositedCount > 0));
    setAllDeposited(depositedCount > 0);
    setDisplayDepositedConfirmation(allValidatorsHaveSameStatus && !allDeposited);
    setContinueButtonDisabled(!((isValidatorsOfflineCheckbox || !displayDepositedConfirmation) && isAgreementReadCheckbox && allValidatorsHaveSameStatus));

    if (publicKeys.length > 0) { bloxApi.request('GET', `/ethereum2/validators-deposits/?network=${network}&publicKeys=${publicKeys.join(',')}`).then((deposits: any) => {
      const newValidatorsStatuses = validators.map((validator) => {
        const newValidator = { ...validator};
        newValidator.deposited = !!deposits[validator.publicKey];
        return newValidator;
      });
      setValidators(newValidatorsStatuses);
      setLoadingStatuses(false);
    }); }
    onPageClick(0);
  }, [validators, allDeposited, isAgreementReadCheckbox, isValidatorsOfflineCheckbox, allValidatorsHaveSameStatus, displayDepositedConfirmation]);

  const onNextButtonClick = () => {
    if (allDeposited) {
      setPage(config.WIZARD_PAGES.VALIDATOR.SLASHING_WARNING);
      return;
    }
    const onSuccess = () => {
      if ((!isLoading || error) && !dontRunProcessAgain) {
        startProcess('createAccount',
          `Create Validator${decryptedKeyStores.length > 0 ? 's' : ''}...`,
          {
            inputData: decryptedKeyStores.map(account => account.privateKey).join(',')
          });
      }
      setMoveToDepositOverview(true);
    };
    checkIfPasswordIsNeeded(onSuccess);
  };

  if (!paginationInfo) {
    onPageClick(0);
  }

  const actionButtonText = allDeposited ? 'Next' : `Run Validator${validators.length > 1 ? 's' : ''} with BloxStaking`;

  return (
    <Wrapper>
      <BackButton onClick={() => {
        if (!isLoading) {
          clearDecryptKeyStores();
          setStep(config.WIZARD_STEPS.VALIDATOR_SETUP);
          setPage(config.WIZARD_PAGES.VALIDATOR.UPLOAD_KEYSTORE_FILE);
        }
        if (error || isDone) {
          clearProcessState();
          clearDecryptProgress();
        }
      }} />
      <Title>Validators Summary</Title>
      <Paragraph style={{ marginBottom: 10 }}>
        List of validators to be added:
      </Paragraph>
      <br />

      <TableWrapper>
        <Table
          data={pagedValidators}
          columns={tableColumns}
          withHeader
          onPageClick={onPageClick}
          isPagination
          paginationInfo={paginationInfo}
          totalCount={validators.length}
          sortType="disabled"
          navButtonWidth="15%"
          rowMinHeight="40px"
          headerHeight="40px"
          footerHeight="40px"
        />
      </TableWrapper>
      {!allValidatorsHaveSameStatus && <Warning style={{maxWidth: '100%', marginTop: '20px'}} text={notTheSameError} />}

      {(!loadingStatuses && allValidatorsHaveSameStatus) &&
      <>
        <Checkbox
          checked={isAgreementReadCheckbox}
          onClick={() => {
            setAgreementReadCheckbox(!isAgreementReadCheckbox);
          }}
          checkboxStyle={checkboxStyle}
          labelStyle={checkboxLabelStyle}
        >
          I agree to Blox&apos;s&nbsp;
          <Link
            onClick={(event) => onLinkClick(event, 'privacy-policy')}
            href={privacyPolicyLink}
          >
            Privacy Policy
          </Link>
          &nbsp;and&nbsp;
          <Link
            onClick={(event) => onLinkClick(event, 'terms-of-use')}
            href={serviceAgreementLink}
          >
            License and Service Agreement
          </Link>
        </Checkbox>

      {displayDepositedConfirmation && (
        <Checkbox
          checked={isValidatorsOfflineCheckbox}
          onClick={() => {
            setValidatorsOfflineCheckbox(!isValidatorsOfflineCheckbox);
          }}
          checkboxStyle={checkboxStyle}
          labelStyle={checkboxLabelStyle}
        >
          I confirm that I haven&apos;t deposited any of my validators above.
        </Checkbox>
      )}

        <ButtonWrapper>
          <Button
            isDisabled={isContinueButtonDisabled}
            onClick={() => {
              !isContinueButtonDisabled && onNextButtonClick();
            }}>
            {actionButtonText}
          </Button>
          {isLoading && (
            <ProgressWrapper>
              <ProcessLoader text={processMessage} precentage={loaderPercentage}/>
              <SmallText withWarning/>
            </ProgressWrapper>
          )}
          {error && (
            <ErrorMessage>
              {error}, please try again.
            </ErrorMessage>
          )}
        </ButtonWrapper>
      </>
      }
    </Wrapper>
  );
};

bloxApi.init();

type ValidatorsSummaryProps = {
  idToken: any;
  page: number;
  step: number;
  network: string;
  decryptedKeyStores: Array<any>,
  setPage: (page: number) => void;
  setStep: (page: number) => void;
  setPageData: (data: any) => void;
  wizardActions: Record<string, any>;
};

const mapStateToProps = (state: any) => ({
  network: getNetwork(state),
  decryptedKeyStores: getDecryptedKeyStores(state),
  idToken: getIdToken(state),
});

const mapDispatchToProps = (dispatch) => ({
  wizardActions: bindActionCreators(actionsFromWizard, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ValidatorsSummary);
