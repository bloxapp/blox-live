import React, {useState} from 'react';
import Migration from '~app/components/Migration/Migration/Migration';
import Preparation from '~app/components/Migration/Preparation/Preparation';
import {SSVMigrationStatus} from '~app/backend/services/users/users.service';

const MigrationFlow = ({ migrationStatus }: { migrationStatus: SSVMigrationStatus }) => {
  const [currentFlow, setCurrentFlow] = useState(migrationStatus === SSVMigrationStatus.ONGOING ? 1 : 0);

  const changeFlowHandler = () => {
    setCurrentFlow((currentFlow + 1) % 2);
  };

  if (currentFlow === 0) {
    return <Preparation changeToNextFlow={changeFlowHandler} />;
  }
  return <Migration changeToPrevFlow={changeFlowHandler} migrationStatus={migrationStatus} />;
};

export default MigrationFlow;
