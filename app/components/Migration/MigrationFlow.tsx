import React, {useState} from 'react';
import Migration from '~app/components/Migration/Migration/Migration';
import Preparation from '~app/components/Migration/Preparation/Preparation';

const MIGRATION_FLOWS = {
  PREPARATION: 0,
  MIGRATION: 1,
};

const MigrationFlow = () => {
  const [currentFlow, setCurrentFlow] = useState(MIGRATION_FLOWS.PREPARATION);

  const components = {
    [MIGRATION_FLOWS.PREPARATION]: Preparation,
    [MIGRATION_FLOWS.MIGRATION]: Migration,
  };

  const changeFlowHandler = () => {
    setCurrentFlow(currentFlow === 0 ? MIGRATION_FLOWS.MIGRATION : MIGRATION_FLOWS.PREPARATION);
  };

  const Component = components[currentFlow];

  return <Component nextFlow={changeFlowHandler} />;
};

export default MigrationFlow;
