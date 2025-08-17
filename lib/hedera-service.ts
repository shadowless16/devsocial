import { Client, AccountId, PrivateKey, TransferTransaction, Hbar, AccountBalanceQuery } from '@hashgraph/sdk'

export class HederaService {
  private client: Client
  private operatorAccountId: AccountId
  private operatorPrivateKey: PrivateKey

  constructor() {
    // Initialize client for testnet
    this.client = Client.forTestnet()
    
    // Set operator account (from env vars)
    const accountId = process.env.HEDERA_TESTNET_ACCOUNT_ID
    const privateKey = process.env.HEDERA_TESTNET_PRIVATE_KEY
    
    if (!accountId || !privateKey) {
      throw new Error('Hedera testnet credentials not configured')
    }
    
    this.operatorAccountId = AccountId.fromString(accountId)
    this.operatorPrivateKey = PrivateKey.fromString(privateKey)
    
    this.client.setOperator(this.operatorAccountId, this.operatorPrivateKey)
  }

  async sendTestTransaction(toAccountId: string, amount: number = 1) {
    try {
      const transaction = new TransferTransaction()
        .addHbarTransfer(this.operatorAccountId, Hbar.fromTinybars(-amount * 100000000)) // Convert HBAR to tinybars
        .addHbarTransfer(AccountId.fromString(toAccountId), Hbar.fromTinybars(amount * 100000000))
        .setTransactionMemo('DevSocial Test Transaction')

      const response = await transaction.execute(this.client)
      const receipt = await response.getReceipt(this.client)
      
      return {
        success: true,
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString(),
        explorerUrl: `https://hashscan.io/testnet/transaction/${response.transactionId.toString()}`
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async getAccountBalance(accountId: string) {
    try {
      const query = new AccountBalanceQuery()
        .setAccountId(AccountId.fromString(accountId))
      const balance = await query.execute(this.client)
      return {
        success: true,
        balance: balance.hbars.toString()
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}