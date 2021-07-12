import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import navigationRules from './navigation-rules';
import { MenuItem, SubMenuItem } from './components';
import { Log } from '~app/backend/common/logger/logger';
import { findPageAndStepPath } from '~app/utils/navigation';
import Connection from '~app/backend/common/store-manager/connection';

const Wrapper = styled.div`
  width: 19vw;
  height: 100%;
  padding: 60px 2vw;
  white-space: pre;
  min-width: 200px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Separator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.gray80015};
  margin: 24px 0;
`;

const logger = new Log('Navigation');

const debugPageAndStep = (_page: number, _step: number) => {
  logger.debug(`🔶 PAGE ▶️ ${findPageAndStepPath('page', _page, 0)}`);
  logger.debug(`🔶 STEP ▶️ ${findPageAndStepPath('step', 0, _step)}`);
};

const Navigation = (props: Props) => {
  const { page, step, pageData, addAdditionalAccount, accounts } = props;
  const [shouldSetupPassword, setShouldSetupPassword] = useState(false);

  useEffect(() => {
    setShouldSetupPassword(Connection.db().shouldSetupPassword());
  });

  debugPageAndStep(page, step);

  const rulesProps = {
    page,
    step,
    pageData,
    addAdditionalAccount,
    accounts,
    shouldSetupPassword,
  };

  return (
    <Wrapper>
      {navigationRules.map((menuItem, menuItemIndex) => {
        if (!menuItem.show(rulesProps)) {
          return '';
        }

        const isStepDone = menuItem.done(rulesProps);
        const isStepActive = menuItem.active(rulesProps);
        const hideStepNumber = menuItem.hideNumber(rulesProps);

        return (
          <React.Fragment key={`step-container-${menuItemIndex}`}>
            <MenuItem
              key={`step-${menuItemIndex}`}
              text={menuItem.name}
              stepNumber={menuItemIndex + 1}
              hideNumber={hideStepNumber}
              isActive={isStepActive}
              isDone={isStepDone}
            />

            {!isStepDone &&
            // @ts-ignore
            menuItem.pages.map((menuItemPage, menuItemPageIndex) => {
              const show = menuItemPage.show ? menuItemPage.show(rulesProps) : true;
              if (!show) {
                return '';
              }
              const isPageDone = menuItemPage.done(rulesProps);

              return (
                <SubMenuItem
                  key={`page-${menuItemPageIndex}`}
                  text={menuItemPage.name}
                  isActive={menuItemPage.page === page}
                  isDone={isPageDone}
                  showLine
                />
              );
            })}
            {menuItem.separator && <Separator />}
          </React.Fragment>
        );
      })}
    </Wrapper>
  );
};

type Props = {
  page: number;
  pageData: any;
  setPage: (page: number) => void;
  step: number;
  setStep: (page: number) => void;
  addAdditionalAccount: boolean;
  accounts: any;
};

export default Navigation;
