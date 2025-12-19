import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/create', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { ReferralSystemFixed } = await import('../utils/referral-system-fixed');
    const userId = req.user!.id;
    const { referredUserId, referralCode } = req.body;

    if (!referredUserId) {
      return res.status(400).json({ success: false, message: 'Referred user ID is required' });
    }

    if (!referralCode) {
      return res.status(400).json({ success: false, message: 'Referral code is required' });
    }

    if (userId === referredUserId) {
      return res.status(400).json({ success: false, message: 'Cannot refer yourself' });
    }

    const referral = await ReferralSystemFixed.createReferral(userId, referredUserId, referralCode);

    res.status(201).json({ success: true, data: { referral } });
  } catch (error) {
    console.error('Error creating referral:', error);
    res.status(500).json({ success: false, message: 'Failed to create referral' });
  }
});

router.get('/create', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { ReferralSystemFixed } = await import('../utils/referral-system-fixed');
    const userId = req.user!.id;
    const referralCode = await ReferralSystemFixed.getReferralCode(userId);

    res.json({ success: true, data: { referralCode } });
  } catch (error) {
    console.error('Error generating referral code:', error);
    res.status(500).json({ success: false, message: 'Failed to generate referral code' });
  }
});

router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { ReferralSystemFixed } = await import('../utils/referral-system-fixed');
    const userId = req.user!.id;
    const stats = await ReferralSystemFixed.getReferralStats(userId);

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch referral stats' });
  }
});

router.post('/check-all', async (req: Request, res: Response) => {
  try {
    const { Referral } = await import('../models');
    const now = new Date();
    const result = await Referral.updateMany(
      { status: 'pending', expiresAt: { $lt: now } },
      { $set: { status: 'expired' } }
    );

    res.json({
      success: true,
      data: {
        message: `Successfully processed referrals. Expired ${result.modifiedCount} referral(s).`,
        ...result,
      }
    });
  } catch (error) {
    console.error('Error during referral check-all:', error);
    res.status(500).json({ success: false, error: 'Failed to process referrals' });
  }
});

export default router;
