#!/usr/bin/env node

import { startMirrorNodePoller } from '@/workers/mirrorNodePoller'

async function main() {
  console.log('Starting DevSocial Mirror Node Poller...')
  
  try {
    await startMirrorNodePoller()
  } catch (error: unknown) {
    console.error('Failed to start mirror node poller:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...')
  process.exit(0)
})

if (require.main === module) {
  main()
}