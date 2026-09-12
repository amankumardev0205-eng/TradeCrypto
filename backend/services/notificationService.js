const firestoreService = require('./firestoreService');

const NOTIFICATION_COLLECTION = 'notifications';

/**
 * Core In-App Notification Service Layer.
 * Manages creation, retrieval, unread counts, and status updates for notifications.
 */
const notificationService = {
  /**
   * Create a new in-app notification for a user.
   * @param {Object} params
   * @param {string} params.userId - Target user ID
   * @param {string} params.type - Category e.g. KYC, TRADING, WALLET, SECURITY, SYSTEM
   * @param {string} params.title - Notification title header
   * @param {string} params.message - Detailed notification message body
   * @param {Object} [params.metadata] - Optional contextual metadata object
   */
  createNotification: async ({ userId, type = 'SYSTEM', title, message, metadata = {} }) => {
    if (!userId) throw new Error('userId is required for notification creation');
    if (!title || !message) throw new Error('title and message are required');

    const timestamp = new Date().toISOString();
    const notificationData = {
      userId: String(userId),
      type: String(type).toUpperCase(),
      title,
      message,
      read: false,
      readAt: null,
      metadata: metadata || {},
      createdAt: timestamp,
    };

    return await firestoreService.create(NOTIFICATION_COLLECTION, notificationData);
  },

  /**
   * Get notifications for a user sorted by newest first.
   * @param {string} userId
   * @param {number} [limit] - Max items to retrieve (default: 30)
   */
  getUserNotifications: async (userId, limit = 30) => {
    if (!userId) return { notifications: [], unreadCount: 0 };

    let notifications = await firestoreService.getWhere(NOTIFICATION_COLLECTION, 'userId', '==', String(userId));
    
    // Sort by createdAt descending
    notifications.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    
    if (limit) {
      notifications = notifications.slice(0, limit);
    }

    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
      notifications,
      unreadCount,
    };
  },

  /**
   * Get unread notification count for a user.
   * @param {string} userId
   */
  getUnreadCount: async (userId) => {
    if (!userId) return 0;
    const notifications = await firestoreService.getWhere(NOTIFICATION_COLLECTION, 'userId', '==', String(userId));
    return notifications.filter((n) => !n.read).length;
  },

  /**
   * Mark a single notification as read.
   * @param {string} notificationId
   * @param {string} userId
   */
  markAsRead: async (notificationId, userId) => {
    if (!notificationId) return null;

    const notification = await firestoreService.getById(NOTIFICATION_COLLECTION, notificationId);
    if (!notification) return null;

    // Verify ownership
    if (notification.userId !== String(userId)) {
      throw new Error('Unauthorized to modify this notification');
    }

    return await firestoreService.update(NOTIFICATION_COLLECTION, notificationId, {
      read: true,
      readAt: new Date().toISOString(),
    });
  },

  /**
   * Mark all unread notifications as read for a user.
   * @param {string} userId
   */
  markAllAsRead: async (userId) => {
    if (!userId) return 0;

    const notifications = await firestoreService.getWhere(NOTIFICATION_COLLECTION, 'userId', '==', String(userId));
    const unread = notifications.filter((n) => !n.read);

    const timestamp = new Date().toISOString();
    let updatedCount = 0;

    for (const item of unread) {
      await firestoreService.update(NOTIFICATION_COLLECTION, item.id, {
        read: true,
        readAt: timestamp,
      });
      updatedCount++;
    }

    return updatedCount;
  },
};

module.exports = notificationService;
