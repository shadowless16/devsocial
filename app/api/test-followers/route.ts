// app/api/test-followers/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log('DEBUG - Test followers API called');
  
  try {
    const testData = {
      success: true,
      data: {
        followers: [
          {
            _id: '123',
            username: 'testuser',
            displayName: 'Test User',
            avatar: '/placeholder.svg',
            level: 1,
            bio: 'Test bio'
          }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 1,
          hasMore: false
        }
      }
    };
    
    console.log('DEBUG - Returning test data:', testData);
    
    return NextResponse.json(testData);
    
  } catch (error) {
    console.error('DEBUG - Test API error:', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}