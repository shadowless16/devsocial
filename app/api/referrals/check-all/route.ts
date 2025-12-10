import { NextResponse } from "next/server";
import connectDB from "@/lib/core/db";
import Referral from "@/models/Referral";
import { successResponse, errorResponse } from "@/utils/response";

/**
 * @route   POST /api/referrals/check-all
 * @desc    Endpoint to be hit by a cron job to update the status of expired referrals.
 * @access  Public (should be protected by a secret or IP whitelist in production)
 */
export async function POST() {
  try {
    await connectDB();

    const now = new Date();
    const result = await Referral.updateMany(
      { status: "pending", expiresAt: { $lt: now } },
      { $set: { status: "expired" } }
    );

    return NextResponse.json(
      successResponse({
        message: `Successfully processed referrals. Expired ${result.modifiedCount} referral(s).`,
        ...result,
      })
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error during referral check-all:", errorMessage);
    return NextResponse.json(
      errorResponse("Failed to process referrals"),
      { status: 500 }
    );
  }
}
