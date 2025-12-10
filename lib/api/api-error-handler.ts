import { NextResponse } from 'next/server';
import { errorResponse } from '@/utils/response';

export interface DatabaseError extends Error {
  code?: number;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
}

export function handleDatabaseError(error: DatabaseError): NextResponse {
  console.error('Database error:', error);

  // Handle duplicate key errors (E11000)
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    
    let message = 'Duplicate entry detected';
    
    // Customize message based on field
    if (field.includes('user') && field.includes('post')) {
      message = 'You have already liked this post';
    } else if (field.includes('user') && field.includes('comment')) {
      message = 'You have already liked this comment';
    } else if (field.includes('post') && field.includes('ip')) {
      message = 'View already recorded for this post';
    } else if (field === 'username') {
      message = 'Username already exists';
    } else if (field === 'email') {
      message = 'Email already registered';
    }
    
    return NextResponse.json(
      errorResponse(message), 
      { status: 409 }
    );
  }

  // Handle connection timeout errors
  if (error.message?.includes('timeout') || error.message?.includes('ECONNRESET')) {
    return NextResponse.json(
      errorResponse('Database connection timeout. Please try again.'), 
      { status: 503 }
    );
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return NextResponse.json(
      errorResponse('Invalid data provided'), 
      { status: 400 }
    );
  }

  // Handle cast errors (invalid ObjectId)
  if (error.name === 'CastError') {
    return NextResponse.json(
      errorResponse('Invalid ID format'), 
      { status: 400 }
    );
  }

  // Generic server error
  return NextResponse.json(
    errorResponse('Internal server error'), 
    { status: 500 }
  );
}

export function withErrorHandling<T extends unknown[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleDatabaseError(error as DatabaseError);
    }
  };
}