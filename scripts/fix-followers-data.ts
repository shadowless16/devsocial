// scripts/fix-followers-data.ts
import connectDB from "@/lib/db";
import User from "@/models/User";
import Follow from "@/models/Follow";

async function fixFollowersData() {
  try {
    await connectDB();
    console.log("Connected to database");

    // Get AkDavid user
    const akDavidUser = await User.findOne({ username: "AkDavid" });
    if (!akDavidUser) {
      console.log("AkDavid user not found");
      return;
    }

    console.log(`AkDavid user found: ${akDavidUser._id}`);
    console.log(`Current followersCount: ${akDavidUser.followersCount}`);
    console.log(`Current followingCount: ${akDavidUser.followingCount}`);

    // Check actual Follow records
    const actualFollowers = await Follow.countDocuments({ following: akDavidUser._id });
    const actualFollowing = await Follow.countDocuments({ follower: akDavidUser._id });

    console.log(`Actual followers in Follow collection: ${actualFollowers}`);
    console.log(`Actual following in Follow collection: ${actualFollowing}`);

    // Get the actual follower records
    const followerRecords = await Follow.find({ following: akDavidUser._id })
      .populate("follower", "username displayName")
      .lean();

    console.log("Follower records:");
    followerRecords.forEach((record: any) => {
      console.log(`- ${record.follower?.username || 'Unknown'} (${record.follower?.displayName || 'No display name'})`);
    });

    // Update the counts to match reality
    await User.findByIdAndUpdate(akDavidUser._id, {
      followersCount: actualFollowers,
      followingCount: actualFollowing
    });

    console.log(`Updated AkDavid's counts - Followers: ${actualFollowers}, Following: ${actualFollowing}`);

  } catch (error) {
    console.error("Error fixing followers data:", error);
  } finally {
    process.exit(0);
  }
}

fixFollowersData();