// import { NextResponse } from "next/server"

// export function successResponse(data: any, status = 200) {
//   return NextResponse.json(
//     {
//       success: true,
//       data,
//     },
//     { status },
//   )
// }

// export function errorResponse(message: string, status = 400, errors?: any) {
//   return NextResponse.json(
//     {
//       success: false,
//       message,
//       errors,
//     },
//     { status },
//   )
// }

// export function validationErrorResponse(errors: any) {
//   return NextResponse.json(
//     {
//       success: false,
//       message: "Validation failed",
//       errors,
//     },
//     { status: 400 },
//   )
// }

// utils/response.ts
import { NextResponse } from "next/server";

interface ResponseData {
  [key: string]: any;
}

/**
 * Creates a standardized success response.
 * @param data - The payload to send.
 * @param status - The HTTP status code (default: 200).
 * @returns A JSON response object.
 */
export function successResponse(data: ResponseData, status: number = 200) {
  return {
    success: true,
    data,
  };
}

/**
 * Creates a standardized error response.
 * @param message - The error message.
 * @param status - The HTTP status code (default: 500).
 * @returns A JSON response object.
 */
export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    {
      success: false,
      error: { message },
    },
    { status }
  );
}

/**
 * Creates a standardized validation error response.
 * @param errors - The formatted Zod errors.
 * @returns A JSON response object.
 */
export function validationErrorResponse(errors: any, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message: "Validation failed",
        details: errors,
      },
    },
    { status }
  );
}
