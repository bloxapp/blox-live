import { execPath } from '~app/binaries';
import Strategy, { GetAccountProps, HighestValuesProps } from '~app/backend/services/key-manager/Strategy/strategy.interface';

export default class Seed implements Strategy {
  executablePath: string;

  constructor() {
    this.executablePath = execPath;
  }

  getAccountCommand(props: GetAccountProps): string {
    const {index, network, inputData, accumulate, object} = props;
    let {highestSource, highestTarget, highestProposal} = props;

    if (!(highestSource && highestSource && highestProposal)) {
      const highestValues = this.getHighestValues({index, accumulate});
      highestSource = highestValues.highestSource;
      highestTarget = highestValues.highestTarget;
      highestProposal = highestValues.highestProposal;
    }

    return `${this.executablePath} \
      wallet account create \
      --seed=${inputData} \
      --index=${index} \
      --network=${network} \
      ${object ? '--response-type=object' : ''} \
      --accumulate=${accumulate} \
      --highest-source=${highestSource} \
      --highest-target=${highestTarget} \
      --highest-proposal=${highestProposal} \
      `;
  }

  /**
   * Return highest values to get account with
   * @param props
   */
  getHighestValues(props: HighestValuesProps) {
    const {accumulate, index} = props;
    let highestSource = '';
    let highestTarget = '';
    let highestProposal = '';

    if (accumulate) {
      for (let i = 0; i <= index; i += 1) {
        highestSource += `0${i === parseInt(String(index), 10) ? '' : ','}`;
        highestTarget += `1${i === parseInt(String(index), 10) ? '' : ','}`;
      }
      highestProposal = highestTarget;
    } else {
      highestSource = '0';
      highestTarget = '1';
      highestProposal = '1';
    }
    return {
      highestSource,
      highestTarget,
      highestProposal,
    };
  }
}
