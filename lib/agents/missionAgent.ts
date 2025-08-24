import { 
  Client, 
  TopicMessageSubmitTransaction, 
  TopicMessageQuery,
  AccountId,
  PrivateKey
} from '@hashgraph/sdk'

interface Mission {
  missionId: string
  title: string
  reward: string
}

export class MissionAgent {
  private client: Client
  private topicId: string
  private operatorAccountId: AccountId
  private operatorPrivateKey: PrivateKey

  constructor() {
    // Initialize client for testnet
    this.client = Client.forTestnet()
    
    // Get credentials from env
    const accountId = process.env.HEDERA_TESTNET_ACCOUNT_ID
    const privateKey = process.env.HEDERA_TESTNET_PRIVATE_KEY
    const topicId = process.env.HEDERA_TOPIC_ID
    
    if (!accountId || !privateKey || !topicId) {
      throw new Error('Hedera credentials not configured')
    }
    
    this.operatorAccountId = AccountId.fromString(accountId)
    this.operatorPrivateKey = PrivateKey.fromString(privateKey)
    this.topicId = topicId
    
    this.client.setOperator(this.operatorAccountId, this.operatorPrivateKey)
  }

  async writeMessage(message: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      const transaction = new TopicMessageSubmitTransaction({
        topicId: this.topicId,
        message: message,
      })

      const response = await transaction.execute(this.client)
      const receipt = await response.getReceipt(this.client)
      
      return {
        success: true,
        transactionId: response.transactionId.toString()
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async readMessages(): Promise<{ success: boolean; messages?: any[]; error?: string }> {
    try {
      const messages: any[] = []
      
      new TopicMessageQuery()
        .setTopicId(this.topicId)
        .setStartTime(0)
        .subscribe(this.client, null, (message) => {
          messages.push({
            consensusTimestamp: message.consensusTimestamp.toString(),
            contents: Buffer.from(message.contents).toString(),
            runningHash: message.runningHash.toString(),
            sequenceNumber: message.sequenceNumber.toString()
          })
        })

      // Wait a bit for messages to be collected
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return {
        success: true,
        messages
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async createMission(): Promise<Mission> {
    const missions = [
      { title: "Solve a coding puzzle", reward: "10 XP" },
      { title: "Write your first post", reward: "15 XP" },
      { title: "Follow 3 developers", reward: "20 XP" },
      { title: "Comment on 5 posts", reward: "25 XP" },
      { title: "Share a code snippet", reward: "30 XP" }
    ]
    
    const randomMission = missions[Math.floor(Math.random() * missions.length)]
    const missionId = String(Date.now()).slice(-3).padStart(3, '0')
    
    const mission: Mission = {
      missionId,
      title: randomMission.title,
      reward: randomMission.reward
    }
    
    // Log mission to Hedera HCS
    const hcsMessage = JSON.stringify({
      type: 'MISSION_CREATED',
      mission,
      timestamp: new Date().toISOString()
    })
    
    await this.writeMessage(hcsMessage)
    
    return mission
  }

  async testConnection(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const testMessage = `Test message from MissionAgent at ${new Date().toISOString()}`
      const writeResult = await this.writeMessage(testMessage)
      
      if (!writeResult.success) {
        return writeResult
      }

      return {
        success: true,
        message: `Successfully connected to Hedera testnet and wrote message to topic ${this.topicId}`
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}