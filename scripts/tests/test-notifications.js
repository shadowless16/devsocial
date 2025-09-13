const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  actionUrl: String,
  data: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: String,
  avatar: String,
  role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
  level: { type: Number, default: 1 },
  points: { type: Number, default: 10 }
}, { timestamps: true });

const Notification = mongoose.model('Notification', NotificationSchema);
const User = mongoose.model('User', UserSchema);

async function testNotifications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find AkDavid user
    const user = await User.findOne({ username: 'AkDavid' });
    if (!user) {
      console.log('❌ AkDavid user not found');
      return;
    }

    console.log(`📧 Found user: ${user.username} (${user._id})`);

    // Check existing notifications
    const notifications = await Notification.find({ recipient: user._id });
    const unreadCount = await Notification.countDocuments({ recipient: user._id, read: false });

    console.log(`📊 Total notifications: ${notifications.length}`);
    console.log(`📊 Unread notifications: ${unreadCount}`);

    if (notifications.length === 0) {
      console.log('🔔 Creating test notifications...');
      
      // Create some test notifications
      await Notification.create([
        {
          recipient: user._id,
          sender: user._id,
          type: 'like',
          title: 'Someone liked your post',
          message: 'Your post received a new like!',
          read: false
        },
        {
          recipient: user._id,
          sender: user._id,
          type: 'comment',
          title: 'New comment on your post',
          message: 'Someone commented on your post!',
          read: false
        },
        {
          recipient: user._id,
          sender: user._id,
          type: 'follow',
          title: 'New follower',
          message: 'Someone started following you!',
          read: false
        }
      ]);

      console.log('✅ Created 3 test notifications');
    }

    // Check final count
    const finalUnreadCount = await Notification.countDocuments({ recipient: user._id, read: false });
    console.log(`📊 Final unread count: ${finalUnreadCount}`);

    // List all notifications
    const allNotifications = await Notification.find({ recipient: user._id }).sort({ createdAt: -1 });
    console.log('\n📋 All notifications:');
    allNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title} - ${notif.read ? 'READ' : 'UNREAD'} (${notif.createdAt})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testNotifications();