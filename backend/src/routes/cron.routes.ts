import { Router, Request, Response } from 'express'
import { AnalyticsService } from '../services/analytics.service'
import { XPOvertakeService } from '../utils/xp-overtake-service'
import { ReferralSystemFixed } from '../utils/referral-system-fixed'
import { Referral } from '../models'

const router = Router()

// Simple secret-based auth for cron jobs
const cronAuth = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.get?.('authorization') || req.headers['authorization'];
  const cronSecret = process.env.CRON_SECRET || 'dev-secret';
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized cron request' });
  }
  next();
};

// GET /api/cron/analytics - Generate daily analytics
router.get('/analytics', cronAuth, async (req: Request, res: Response) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    await AnalyticsService.generateDailySnapshot(yesterday);
    
    res.json({ 
      success: true, 
      message: `Analytics generated for ${yesterday.toISOString().split('T')[0]}`,
      timestamp: new Date().toISOString()
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Cron analytics generation error:', errorMessage);
    res.status(500).json({ success: false, message: 'Failed to generate analytics', error: errorMessage });
  }
});

// GET /api/cron/check-overtakes - Check XP overtakes and notify users
router.get('/check-overtakes', cronAuth, async (req: Request, res: Response) => {
  try {
    const [allTime, weekly, monthly] = await Promise.all([
      XPOvertakeService.checkAndNotifyOvertakes('all-time'),
      XPOvertakeService.checkAndNotifyOvertakes('weekly'),
      XPOvertakeService.checkAndNotifyOvertakes('monthly')
    ]);
    
    res.json({
      success: true,
      message: `Checked overtakes - All-time: ${allTime.overtakes}, Weekly: ${weekly.overtakes}, Monthly: ${monthly.overtakes}`,
      timestamp: new Date().toISOString()
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Cron overtake check error:', errorMessage);
    res.status(500).json({ success: false, message: 'Failed to check overtakes', error: errorMessage });
  }
});

// GET /api/cron/complete-referrals - Process pending referrals
router.get('/complete-referrals', cronAuth, async (req: Request, res: Response) => {
  try {
    const pendingReferrals = await Referral.find({ 
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('referred', 'username points');

    let completed = 0;
    
    for (const referral of pendingReferrals) {
      try {
        await ReferralSystemFixed.checkReferralCompletion((referral.referred as any)._id.toString());
        
        const updated = await Referral.findById(referral._id);
        if (updated && updated.status === 'completed') {
          completed++;
        }
      } catch (error: unknown) {
        console.error(`Error processing referral ${referral._id}:`, error);
      }
    }

    res.json({
      success: true,
      message: `Processed ${pendingReferrals.length} pending referrals, completed ${completed}`,
      processed: pendingReferrals.length,
      completed
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Cron referrals job error:", errorMessage);
    res.status(500).json({ success: false, message: 'Failed to process referrals', error: errorMessage });
  }
});

export default router
