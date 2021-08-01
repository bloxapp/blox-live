export default interface Strategy {
  createBloxAccounts(indexToRestore?: number): Promise<any>
  createAccount(index?: number): Promise<any>
  recovery({ mnemonic, password }: Record<string, any>): Promise<void>
  getSeedOrKeyStores()
}
