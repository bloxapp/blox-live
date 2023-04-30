// import analytics from '../analytics';
import ProcessClass from './process.class';
import AccountService from '../services/account/account.service';

export default class SetWithdrawalAddressProcess extends ProcessClass {
  private readonly accountService: AccountService;
  public readonly actions: Array<any>;

  constructor(params: { seed: string, accounts: Record<string, any>[] }) {
    super('SetWithdrawalAddress');
    this.accountService = new AccountService();

    // Add each account into separate step to display progress properly
    for (let i = 0; i < params.accounts.length; i += 1) {
      this.actions = [
        {
          instance: this.accountService,
          method: 'blsToExecution',
          params: {
            seed: params.seed,
            account: params.accounts[i],
          },
        },
      ];
    }
  }
}
