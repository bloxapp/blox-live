import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Sorting from './Sorting';
import pencilImg from '~app/assets/images/pencil.svg';
import useRouting from '../../../../hooks/useRouting';
import Connection from '../../../../../backend/common/store-manager/connection';
import usePasswordHandler from '../../../../../components/PasswordHandler/usePasswordHandler';
import {isVersionHigherOrEqual} from '../../../../../utils/service';
import config from '../../../../../backend/common/config';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  font-size: 12px;
  padding: 0 16px;
  height: ${({height}) => height || '50px'};
  border-bottom: solid 1px ${({theme}) => theme.gray300};
`;

const Cell = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  width: ${({width}) => width};
  border-left:  ${props => props.withoutColumnBorder ? '' : `solid 1px ${props.theme.gray300}`};
  &:first-child {
    border-left:  0;
  }
  justify-content:${({justifyContent}) => justifyContent || 'flex-start'};
`;

const Pencil = styled.div`
  width: 14px;
  height: 14px;
  cursor: pointer;
  margin-left: 4px;
  background-size: cover;
  justify-content: center;
  background-image: url(${pencilImg});

`;

const Header = ({columns, selectedSorting, sortType, onSortClick, height, withoutColumnBorder}) => {
  const { goToPage, ROUTES } = useRouting();
  const { checkIfPasswordIsNeeded } = usePasswordHandler();

  /**
   * Show dialog using callback and require password if needed
   */
  const showPasswordProtectedDialog = async (callback) => {
    const cryptoKey = 'temp';
    const isTemporaryCryptoKeyValid = await Connection.db().isCryptoKeyValid(cryptoKey);
    if (isTemporaryCryptoKeyValid) {
      // If temp crypto key is valid - we should set it anyway
      await Connection.db().setCryptoKey(cryptoKey);
    }

    return isTemporaryCryptoKeyValid
      ? callback()
      : checkIfPasswordIsNeeded(callback);
  };

  const goToRewardPage = async () => {
    const keyVaultVersion = Connection.db().get('keyVaultVersion');
    if (isVersionHigherOrEqual(keyVaultVersion, config.env.MERGE_SUPPORTED_TAG)) {
      await showPasswordProtectedDialog(() => goToPage(ROUTES.REWARD_ADDRESSES));
    } else {
      goToPage(ROUTES.REWARD_ADDRESSES);
    }
  };

  return (
    <Wrapper
      height={height}
    >
      {columns.map((column, index) => {
        const {key, title, width, justifyContent, compareFunction, writable} = column;
        const withSorting = compareFunction && sortType !== 'disabled';

        if (withSorting) {
          return (
            <Cell
              key={index}
              width={width}
              justifyContent={justifyContent}
              withoutColumnBorder={withoutColumnBorder}
            >
              {title}
              <Sorting
                sortKey={key}
                sortType={sortType}
                onSortClick={onSortClick}
                selectedSorting={selectedSorting}
                compareFunction={compareFunction}
              />
            </Cell>
          );
        }

        return (
          <Cell
            key={index}
            width={width}
            justifyContent={justifyContent}
            withoutColumnBorder={withoutColumnBorder}
          >
            {title}
            {writable && <Pencil onClick={goToRewardPage} />}
          </Cell>
        );
      })}
    </Wrapper>
  );
};

Header.propTypes = {
  columns: PropTypes.array,
  sortType: PropTypes.string,
  onSortClick: PropTypes.func,
  selectedSorting: PropTypes.string,
  withoutColumnBorder: PropTypes.bool,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Header.defaultProps = {
  columns: [],
  height: null,
  selectedSorting: '',
  sortType: 'disabled',
  onSortClick: () => {},
  withoutColumnBorder: false,
};

export default Header;
