// scripts/clean-follow-data.ts
import connectDB from "@/lib/db";
import User from "@/models/User";
import Follow from "@/models/Follow";

async function cleanFollowData() {
  try {
    await connectDB();
    console.log("Connected to database");

    // Find all Follow records with missing user references
    const followsWithMissingUsers = await Follow.find({})
      .populate("follower", "username displayName")
      .populate("following", "username displayName")
      .lean();

    console.log(`Total Follow records: ${followsWithMissingUsers.length}`);

    let deletedCount = 0;
    const toDelete = [];

    for (const follow of followsWithMissingUsers) {
      if (!follow.follower || !follow.following) {
        console.log(`Found invalid follow record: ${follow._id}`);
        console.log(`- Follower: ${follow.follower ? 'exists' : 'MISSING'}`);
        console.log(`- Following: ${follow.following ? 'exists' : 'MISSING'}`);
        toDelete.push(follow._id);
        deletedCount++;
      }
    }

    // Delete invalid follow records
    if (toDelete.length > 0) {
      await Follow.deleteMany({ _id: { $in: toDelete } });
      console.log(`Deleted ${deletedCount} invalid follow records`);
    }

    // Now recalculate all user follow counts
    const allUsers = await User.find({}).select("_id username");
    console.log(`Updating follow counts for ${allUsers.length} users...`);

    for (const user of allUsers) {
      const followersCount = await Follow.countDocuments({ following: user._id });
      const followingCount = await Follow.countDocuments({ follower: user._id });

      await User.findByIdAndUpdate(user._id, {
        followersCount,
        followingCount
      });

      if (followersCount > 0 || followingCount > 0) {
        console.log(`${user.username}: ${followersCount} followers, ${followingCount} following`);
      }
    }

    console.log("Follow data cleanup completed!");

  } catch (error: unknown) {
    console.error("Error cleaning follow data:", error);
  } finally {
    process.exit(0);
  }
}

cleanFollowData();