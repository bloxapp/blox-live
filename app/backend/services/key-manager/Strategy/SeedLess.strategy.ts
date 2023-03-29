import { execPath } from '~app/binaries';
import Strategy, { GetAccountProps, HighestValuesProps } from '~app/backend/services/key-manager/Strategy/strategy.interface';

export default class SeedLess implements Strategy {
  executablePath: string;

  constructor() {
    this.executablePath = execPath;
  }

   getAccountCommand(props: GetAccountProps): string {
    const {index, inputData, network, object, highestSource, highestTarget, highestProposal, enforceSlashingInput} = props;
    let tempHighestSource = highestSource;
    let tempHighestTarget = highestTarget;
    let tempHighestProposal = highestProposal;

     if (enforceSlashingInput && !(highestSource && highestTarget && highestProposal)) throw new Error();
     if (!(highestSource && highestTarget && highestProposal)) {
       const {initHighestSource, initHighestTarget, initHighestProposal} = this.getHighestValues({index, inputData});
       tempHighestSource = initHighestSource;
       tempHighestTarget = initHighestTarget;
       tempHighestProposal = initHighestProposal;
     }

    return `${this.executablePath} \
      wallet account create \
      --private-key=${inputData} \
      --index=${index} \
      --network=${network} \
      ${object ? '--response-type=object' : ''} \
      --highest-source=${tempHighestSource} \
      --highest-target=${tempHighestTarget} \
      --highest-proposal=${tempHighestProposal}`;
  }

  /**
   * Return highest values to get account with
   * @param props
   */
  getHighestValues(props: HighestValuesProps) {
    const {inputData} = props;
    let initHighestSource = '';
    let initHighestTarget = '';
    let initHighestProposal = '';

    for (let i = 0; i < inputData.split(',').length; i += 1) {
      initHighestSource += `${i === 0 ? '' : ','}0`;
      initHighestTarget += `${i === 0 ? '' : ','}1`;
    }
    initHighestProposal = initHighestTarget;
    return {
      initHighestSource,
      initHighestTarget,
      initHighestProposal,
    };
  }
}
