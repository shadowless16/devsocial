import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { successResponse, errorResponse } from "@/utils/response";

export async function GET(req: NextRequest) {
  try {
    // Read the affiliations JSON file
    const filePath = path.join(process.cwd(), "docs", "affiliations.json");
    const fileContent = readFileSync(filePath, "utf-8");
    const raw = JSON.parse(fileContent);

    // Transform the raw JSON structure into the flat structure expected by the frontend
    const techBootcamps = [
      ...(raw.TechbootCamps?.NIIT_Centres || []),
      ...(raw.TechbootCamps?.Top_Bootcamps_Tech_Programmes || []),
    ];

    const nigerian = raw.Nigerian_Universities || {};
    const federal = nigerian.Federal || [];
    const state = nigerian.State || [];
    const privateUniversities = nigerian.Private || [];
    const affiliatedInstitutions = nigerian.Affiliated_Institutions || [];
    const distanceLearning = nigerian.Distance_Learning || [];

    const affiliations = {
      techBootcamps,
      federal,
      state,
      privateUniversities,
      affiliatedInstitutions,
      distanceLearning,
    };

    // Return the transformed affiliations data
    return NextResponse.json(successResponse({ affiliations }));
  } catch (error) {
    console.error("Error fetching affiliations:", error);
    return errorResponse("Failed to fetch affiliations", 500);
  }
}
