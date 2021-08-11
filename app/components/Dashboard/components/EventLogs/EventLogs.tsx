import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import tableColumns from './tableColumns';
import config from '~app/backend/common/config';
import Table from '~app/common/components/Table';
import { handlePageClick } from '~app/common/components/Table/service';
import * as dashboardSelectors from '~app/components/Dashboard/selectors';

const Wrapper = styled.div`
  width: 100%;
  color: ${({theme}) => theme.gray600};
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: 500;
  line-height: 1.69;
  color: ${({theme}) => theme.gray800};
  margin-top: 0;
  margin-bottom: 20px;
`;

const EventLogs = ({ events, isTestNetShow, showNetworkSwitcher }) => {
  const PAGE_SIZE = 10;
  const [pagedEvents, setPagedEvents] = React.useState([]);
  const [paginationInfo, setPaginationInfo] = React.useState(null);
  const [filteredEvents, setFilteredEvents] = React.useState([]);

  React.useEffect(() => {
    if (!events?.length) {
      setFilteredEvents([]);
    } else {
      setFilteredEvents(events.filter((event) => {
        if (!event.network) {
          return true;
        }
        if (!showNetworkSwitcher) {
          return true;
        }
        if (!isTestNetShow) {
          return event.network === config.env.MAINNET_NETWORK;
        }
        return event.network === config.env.PRATER_NETWORK;
      }));
    }
    setPaginationInfo(null);
  }, [events, isTestNetShow, showNetworkSwitcher]);

  const onPageClick = (offset) => {
    handlePageClick(filteredEvents, offset, setPagedEvents, setPaginationInfo, PAGE_SIZE);
  };

  if (paginationInfo == null) {
    onPageClick(0);
    return <Wrapper />;
  }

 return (
   <Wrapper>
     <Title>Latest Events</Title>
     {(pagedEvents && pagedEvents.length > 0) ?
        (
          <Table
            columns={tableColumns}
            data={pagedEvents}
            withHeader={false}
            isPagination
            paginationInfo={paginationInfo}
            onPageClick={onPageClick}
          />
        ) :
     ('There are no events to show at the moment')}
   </Wrapper>
 );
};

EventLogs.propTypes = {
  events: PropTypes.array,
  isTestNetShow: PropTypes.bool,
  showNetworkSwitcher: PropTypes.bool
};

const mapStateToProps = (state) => ({
  isTestNetShow: dashboardSelectors.getTestNetShowFlag(state)
});

export default connect(mapStateToProps, null)(EventLogs);
