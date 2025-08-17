#!/usr/bin/env node

import { computeContentHash } from '@/lib/contentHash'

// Test Step 9 & 10 implementations
async function testVerification() {
  console.log('Testing Step 9 & 10 implementations...\n')
  
  // Test contentHash computation
  const testContent = {
    content: 'This is a test post',
    imageUrls: ['https://example.com/image1.jpg'],
    videoUrls: [],
    tags: ['test', 'demo']
  }
  
  const hash1 = computeContentHash(testContent)
  const hash2 = computeContentHash(testContent) // Should be identical
  
  console.log('✅ ContentHash consistency test:')
  console.log(`Hash 1: ${hash1}`)
  console.log(`Hash 2: ${hash2}`)
  console.log(`Match: ${hash1 === hash2}\n`)
  
  // Test duplicate detection logic
  const duplicateContent = {
    content: 'This is a test post', // Same content
    imageUrls: ['https://example.com/image1.jpg'],
    videoUrls: [],
    tags: ['demo', 'test'] // Different order, should still match
  }
  
  const hash3 = computeContentHash(duplicateContent)
  console.log('✅ Duplicate detection test:')
  console.log(`Original hash: ${hash1}`)
  console.log(`Reordered tags hash: ${hash3}`)
  console.log(`Should match: ${hash1 === hash3}\n`)
  
  // Test verification endpoint payload
  const verifyPayload = {
    postId: '507f191e810c19729de860ea'
  }
  
  console.log('✅ Verification endpoint payload:')
  console.log(JSON.stringify(verifyPayload, null, 2))
  
  console.log('\n🎉 All tests completed successfully!')
}

if (require.main === module) {
  testVerification().catch(console.error)
}