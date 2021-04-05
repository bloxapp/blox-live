import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { CustomModal } from '../../common/components';
import * as actionsFromDashboard from '../Dashboard/actions';
import { Description } from '../../common/components/ModalTemplate/components';

const ConfirmationModalTemplateWrapper = styled.div`
  width:100%;
  height:100%;
  display:flex;
  flex-direction: column;
  z-index:51;
`;

const ButtonsWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-content: center;
  align-items: center;
  margin: auto auto 40px;
`;

const InnerWrapper = styled.div`
  width:100%;
  height:100%;
  display:flex;
`;

const CancelButton = styled.button`
  margin: auto 5px auto auto;
  height: 32px;
  border-radius: 5px;
  font-size: 12px;
  width: 170px;
  background-color: transparent;
  border: 0;
  cursor: pointer;
  color: ${({theme}) => theme.gray600};
`;

const ConfirmButton = styled.button<{ cancelButtonShown: boolean }>`
  margin: auto auto auto ${({ cancelButtonShown }) => cancelButtonShown ? '5px' : 'auto'};
  font-size: 12px;
  height: 32px;
  border-radius: 5px;
  width: 170px;
  background-color: ${({theme}) => theme.primary900};
  border: 0;
  cursor: pointer;
  color: white;
`;

const Title = styled.h1`
  font-size: 26px;
  color: ${({ theme }) => theme.gray800};
  max-height: 144px;
  margin-top: 40px;
  margin-bottom: 30px;
`;

type ConfirmationModalTemplateProps = {
  width: string;
  height: string;
  onClose?: () => void | null;
  children: React.ReactNode;
};

const ConfirmationModalTemplate = ({ width, height, onClose, children }: ConfirmationModalTemplateProps) => {
  return (
    <ConfirmationModalTemplateWrapper>
      <CustomModal
        width={width}
        height={height}
        onClose={onClose}
      >
        <InnerWrapper>
          {children}
        </InnerWrapper>
      </CustomModal>
    </ConfirmationModalTemplateWrapper>
  );
};

const ConfirmationModal = (props: ConfirmationModalProps) => {
  const { text, confirmation, dashboardActions, onSuccess } = props;
  const { title, confirmButtonText, cancelButtonText,
    onConfirmButtonClick, onCancelButtonClick } = confirmation;
  const { clearModalDisplayData } = dashboardActions;

  /**
   * Close dialog fallback
   */
  const onClose = () => {
    if (typeof onCancelButtonClick === 'function') {
      return onCancelButtonClick();
    }
    return clearModalDisplayData();
  };

  /**
   * Confirmation logic
   */
  const onConfirm = () => {
    if (typeof onConfirmButtonClick === 'function') {
      return onConfirmButtonClick();
    }
    return onSuccess ? onSuccess() : clearModalDisplayData();
  };

  return (
    <ConfirmationModalTemplate
      onClose={onCancelButtonClick === false ? null : onClose}
      width={'600px'}
      height={'240px'}
    >
      <ConfirmationModalTemplateWrapper>
        {title && (
          <Title>{title}</Title>
        )}

        {text && (
          <Description>{text}</Description>
        )}

        <ButtonsWrapper>
          {onCancelButtonClick !== false && (
            <CancelButton
              onClick={onClose}
            >
              {cancelButtonText || 'Cancel'}
            </CancelButton>
          )}

          {onConfirmButtonClick && (
            <ConfirmButton
              cancelButtonShown={onCancelButtonClick !== false}
              onClick={onConfirm}
            >
              {confirmButtonText || 'Confirm'}
            </ConfirmButton>
          )}
        </ButtonsWrapper>
      </ConfirmationModalTemplateWrapper>
    </ConfirmationModalTemplate>
  );
};

type ConfirmationModalProps = {
  text: string,
  onSuccess: () => {},
  confirmation: {
    title: string,
    confirmButtonText: string,
    cancelButtonText: string,
    onConfirmButtonClick: () => {},
    onCancelButtonClick: any,
  },
  dashboardActions: any
};

const mapDispatchToProps = (dispatch) => ({
  dashboardActions: bindActionCreators(actionsFromDashboard, dispatch)
});

export default connect(null, mapDispatchToProps)(ConfirmationModal);
