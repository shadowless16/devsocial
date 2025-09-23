import { NextRequest, NextResponse } from "next/server";
import { ReferralSystemFixed } from "@/utils/referral-system-fixed";
import connectDB from "@/lib/db";
import Referral from "@/models/Referral";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get all pending referrals
    const pendingReferrals = await Referral.find({ 
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('referred', 'username points');

    let completed = 0;
    
    for (const referral of pendingReferrals) {
      try {
        await ReferralSystemFixed.checkReferralCompletion(referral.referred._id.toString());
        
        // Check if it was completed
        const updated = await Referral.findById(referral._id);
        if (updated.status === 'completed') {
          completed++;
        }
      } catch (error) {
        console.error(`Error processing referral ${referral._id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${pendingReferrals.length} pending referrals, completed ${completed}`,
      processed: pendingReferrals.length,
      completed
    });

  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}