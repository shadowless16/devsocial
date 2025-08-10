// scripts/test-response-util.ts
import { successResponse } from "@/utils/response";

function testResponseUtil() {
  console.log('Testing successResponse utility...');
  
  const testData = {
    followers: [
      { _id: '123', username: 'test', displayName: 'Test User' }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 1,
      hasMore: false
    }
  };
  
  try {
    const response = successResponse(testData);
    console.log('Response object:', response);
    console.log('Response body:', response.body);
  } catch (error) {
    console.error('Error creating response:', error);
  }
}

testResponseUtil();