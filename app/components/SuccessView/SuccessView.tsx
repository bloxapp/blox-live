import React from 'react';
import { connect } from 'react-redux';
import { Title, SuccessIcon } from '~app/components/Wizard/components/common';

const SuccessView = (props: Props) => {
  const { title, children } = props;
  return (
    <>
      <SuccessIcon />
      <Title color="accent2400" style={{ marginTop: 30 }}>{title || 'Success!'}</Title>
      {children || ''}
    </>
  );
};

type Props = {
  title?: any,
  children: any[],
};

export default connect(null, null)(SuccessView);
