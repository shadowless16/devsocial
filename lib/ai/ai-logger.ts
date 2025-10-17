import AILog from '@/models/AILog'

interface LogParams {
  service: 'mistral' | 'gemini'
  aiModel: string
  taskType: string
  inputLength: number
  outputSummary: string
  userId?: string
  success: boolean
  errorMessage?: string
  executionTime: number
}

export async function logAIAction(params: LogParams): Promise<void> {
  try {
    await AILog.create({
      service: params.service,
      aiModel: params.aiModel,
      taskType: params.taskType,
      inputLength: params.inputLength,
      outputSummary: params.outputSummary.substring(0, 500),
      userId: params.userId,
      success: params.success,
      errorMessage: params.errorMessage,
      executionTime: params.executionTime
    })
  } catch (error) {
    console.error('Failed to log AI action:', error)
  }
}
