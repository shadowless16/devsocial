import XPLog from "../models/XPLog";
import { DAILY_LIMITS } from "./xp-system";

export async function checkDailyLimit(
  userId: string,
  action: keyof typeof DAILY_LIMITS
): Promise<{ allowed: boolean; count: number; limit: number }> {
  const limit = DAILY_LIMITS[action];
  
  if (typeof limit === 'undefined') {
    return { allowed: true, count: 0, limit: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await XPLog.countDocuments({
    userId,
    type: action,
    createdAt: { $gte: today, $lt: tomorrow }
  } as any);

  return {
    allowed: count < limit,
    count,
    limit
  };
}
