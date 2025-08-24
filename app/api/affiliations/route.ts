import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/utils/response";
import { MongoClient } from "mongodb";

// Create a single, reusable MongoClient instance.
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}
const client = new MongoClient(uri);
let clientPromise = client.connect();

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Ensure the client is connected
    await clientPromise;
    
    const db = client.db();
    const collection = db.collection("affiliations");

    // Fetch the affiliations data from MongoDB
    const affiliationRecord = await collection.findOne({ type: "affiliations" });
    if (!affiliationRecord) {
      return errorResponse("No affiliations data found in database. Please run the load script first.", 404);
    }

    // Return the affiliations data
    return successResponse({ affiliations: affiliationRecord.data });
  } catch (error) {
    console.error("Error fetching affiliations:", error);
    // In case of connection errors, try to reconnect.
    clientPromise = client.connect();
    return errorResponse(`Failed to fetch affiliations: ${(error as Error).message}`, 500);
  }
}
