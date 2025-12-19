import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/conversations', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { Conversation } = await import('../models');
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({
      participants: userId,
      isArchived: false,
    })
      .populate([
        {
          path: 'participants',
          select: 'username displayName avatar online lastSeen',
          match: { _id: { $ne: userId } },
        },
        {
          path: 'lastMessage',
          populate: {
            path: 'sender',
            select: 'username displayName',
          },
        },
      ])
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(limit);

    const totalConversations = await Conversation.countDocuments({
      participants: userId,
      isArchived: false,
    });

    const conversationsWithUnread = conversations.map((conv) => ({
      ...conv.toObject(),
      unreadCount: conv.unreadCount.get(userId) || 0,
      otherParticipant: conv.participants.find((p: any) => p._id.toString() !== userId),
    }));

    res.json({
      success: true,
      data: {
        conversations: conversationsWithUnread,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalConversations / limit),
          totalConversations,
          hasMore: skip + conversations.length < totalConversations,
        },
      }
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
  }
});

router.get('/:conversationId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { Message, Conversation } = await import('../models');
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalMessages = await Message.countDocuments({ conversation: conversationId });

    conversation.unreadCount.set(userId, 0);
    await conversation.save();

    res.json({
      success: true,
      data: {
        messages: messages.reverse(),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalMessages / limit),
          totalMessages,
          hasMore: skip + messages.length < totalMessages,
        },
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

router.post('/:conversationId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { Message, Conversation, Notification } = await import('../models');
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const { content, type, fileUrl } = req.body;

    if (!content && !fileUrl) {
      return res.status(400).json({ success: false, error: 'Message content or file is required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      content,
      type: type || 'text',
      fileUrl,
    });

    await message.populate('sender', 'username displayName avatar');

    conversation.lastMessage = message._id;
    conversation.lastActivity = new Date();
    
    conversation.participants.forEach((participantId: any) => {
      if (participantId.toString() !== userId) {
        const currentCount = conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(participantId.toString(), currentCount + 1);
      }
    });

    await conversation.save();

    const otherParticipants = conversation.participants.filter((p: any) => p.toString() !== userId);
    for (const participantId of otherParticipants) {
      await Notification.create({
        recipient: participantId,
        sender: userId,
        type: 'message',
        title: 'New message',
        message: content?.substring(0, 100) || 'Sent you a file',
        actionUrl: `/messages/${conversationId}`,
      });
    }

    res.status(201).json({ success: true, data: { message } });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

export default router;
