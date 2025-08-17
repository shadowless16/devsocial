import { Client, TopicMessageSubmitTransaction, AccountId, PrivateKey } from '@hashgraph/sdk'

interface ConsensusMessageResponse {
  topicId: string
  seq: number
  txId: string
  submittedAt: Date
}

interface ConsensusMessage {
  v: number
  t: number
  pid: string
  aid: string
  h: string
  at: string
}

export async function submitConsensusMessage(
  topicId: string, 
  messageString: string
): Promise<ConsensusMessageResponse> {
  const client = Client.forTestnet()
  
  const accountId = process.env.HEDERA_TESTNET_ACCOUNT_ID
  const privateKey = process.env.HEDERA_TESTNET_PRIVATE_KEY
  
  if (!accountId || !privateKey) {
    throw new Error('Hedera credentials not configured')
  }
  
  client.setOperator(AccountId.fromString(accountId), PrivateKey.fromString(privateKey))
  
  try {
    const transaction = new TopicMessageSubmitTransaction({
      topicId,
      message: messageString,
    })
    
    const response = await transaction.execute(client)
    const receipt = await response.getReceipt(client)
    
    return {
      topicId,
      seq: receipt.topicSequenceNumber?.toNumber() || 0,
      txId: response.transactionId.toString(),
      submittedAt: new Date()
    }
  } finally {
    client.close()
  }
}

export function createConsensusMessage(
  postId: string,
  authorId: string, 
  contentHash: string
): string {
  const message: ConsensusMessage = {
    v: 1,
    t: Date.now(),
    pid: postId,
    aid: authorId,
    h: contentHash,
    at: new Date().toISOString()
  }
  
  return JSON.stringify(message)
}