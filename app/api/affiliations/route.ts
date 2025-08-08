import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/utils/response";
import { MongoClient } from "mongodb";

export async function GET(req: NextRequest) {
  let client;
  
  try {
    // Connect to MongoDB using MongoClient
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }
    
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db();
    const collection = db.collection("affiliations");

    // Fetch the affiliations data from MongoDB
    const affiliationRecord = await collection.findOne({ type: "affiliations" });
    if (!affiliationRecord) {
      throw new Error("No affiliations data found in database. Please run the load script first.");
    }

    // Return the affiliations data
    return successResponse({ affiliations: affiliationRecord.data });
  } catch (error) {
    console.error("Error fetching affiliations:", error);
    return errorResponse(`Failed to fetch affiliations: ${(error as Error).message}`, 500);
  } finally {
    // Close the connection
    if (client) {
      await client.close();
    }
  }
}
