export interface ImprintJob {
  postId: string
  contentHash: string
}

export async function enqueueImprintJob(job: ImprintJob): Promise<void> {
  // For now, this is a simple async function call
  // In production, this would integrate with a proper queue system
  console.log('Enqueuing imprint job:', job)
  
  // Import and call worker directly for now
  const { processImprintJob } = await import('@/workers/imprintWorker')
  
  // Process asynchronously without blocking the response
  setImmediate(() => {
    processImprintJob(job).catch(error => {
      console.error('Imprint job processing failed:', error)
    })
  })
}