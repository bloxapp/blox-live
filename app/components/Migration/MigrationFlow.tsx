import React, {useState} from 'react';
import Migration from '~app/components/Migration/Migration/Migration';
import Preparation from '~app/components/Migration/Preparation/Preparation';

const MigrationFlow = () => {
  const [currentFlow, setCurrentFlow] = useState(0);

  const changeFlowHandler = () => {
    setCurrentFlow((currentFlow + 1) % 2);
  };

  if (currentFlow === 0) {
    return <Preparation changeToNextFlow={changeFlowHandler} />;
  }
  return <Migration changeToPrevFlow={changeFlowHandler} />;
};

export default MigrationFlow;
