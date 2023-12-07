import React, {useState} from 'react';
import MigrationPhase1 from './Migration/MigrationPhase1';
import Preparation from '~app/components/Migration/Preparation/Preparation';
import {SSVMigrationStatus} from '~app/backend/services/users/users.service';
import MigrationFAQ from './MigrationFAQ/MigrationFAQ';

const MigrationFlow = ({ migrationStatus }: { migrationStatus: SSVMigrationStatus }) => {
  const [currentFlow, setCurrentFlow] = useState(migrationStatus === SSVMigrationStatus.CREATED_KEYSHARES ? 2 : 0);

  const goBackHandler = () => {
    if (currentFlow - 1 >= 0) {
      setCurrentFlow(currentFlow - 1);
    }
  };

  const moveForwardHandler = () => {
    if (currentFlow + 1 <= 2) {
      setCurrentFlow(currentFlow + 1);
    }
  };

  if (currentFlow === 0) {
    return <MigrationFAQ changeToNextFlow={moveForwardHandler} />;
  }
  if (currentFlow === 1) {
    return <Preparation changeToNextFlow={moveForwardHandler} changeToPrevFlow={goBackHandler} />;
  }
  return <MigrationPhase1 changeToPrevFlow={goBackHandler} migrationStatus={migrationStatus} />;
};

export default MigrationFlow;
