import { NextResponse } from "next/server";
import { ReferralSystemFixed } from "@/utils/referral-system-fixed";
import connectDB from "@/lib/core/db";
import Referral from "@/models/Referral";

export const dynamic = 'force-dynamic';

export async function GET() {
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
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error(`Error processing referral ${referral._id}:`, errorMessage);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${pendingReferrals.length} pending referrals, completed ${completed}`,
      processed: pendingReferrals.length,
      completed
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Cron job error:", errorMessage);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
