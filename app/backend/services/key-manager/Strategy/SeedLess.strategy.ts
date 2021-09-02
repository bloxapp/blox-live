import { execPath } from '~app/binaries';
import Strategy, { GetAccountProps, HighestValuesProps } from '~app/backend/services/key-manager/Strategy/strategy.interface';

export default class SeedLess implements Strategy {
  executablePath: string;

  constructor() {
    this.executablePath = execPath;
  }

   getAccountCommand(props: GetAccountProps): string {
    const {index, inputData, network, object} = props;
    const {highestSource, highestTarget, highestProposal} = this.getHighestValues({index, inputData});

    return `${this.executablePath} \
      wallet account create-seedless \
      --private-key=${inputData} \
      --index-from=${index} \
      --network=${network} \
      ${object ? '--response-type=object' : ''} \
      --highest-source=${highestSource} \
      --highest-target=${highestTarget} \
      --highest-proposal=${highestProposal}`;
  }

  /**
   * Return highest values to get account with
   * @param props
   */
  getHighestValues(props: HighestValuesProps) {
    const {inputData} = props;
    let highestSource = '';
    let highestTarget = '';
    let highestProposal = '';

    for (let i = 0; i < inputData.split(',').length; i += 1) {
      highestSource += `${i === 0 ? '' : ','}${i.toString()}`;
      highestTarget += `${i === 0 ? '' : ','}${(i + 1).toString()}`;
    }
    highestProposal = highestSource;
    return {
      highestSource,
      highestTarget,
      highestProposal,
    };
  }
}
