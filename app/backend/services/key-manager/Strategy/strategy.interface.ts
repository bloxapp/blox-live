export type HighestValuesProps = {
  index: number
  accumulate?: boolean,
  inputData?: string,
};

export type GetAccountProps = {
  index: number,
  network: string,
  inputData: string,
  accumulate?: boolean
  highestSource?: string,
  highestTarget?: string,
  highestProposal?: string,
  object?: boolean,
};

export default interface Strategy {
  executablePath: string;
  getAccountCommand(props: GetAccountProps): string
  getHighestValues(props: HighestValuesProps): object
}
