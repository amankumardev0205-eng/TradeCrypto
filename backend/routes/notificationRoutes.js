const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { NotFoundError, BadRequestError } = require('../utils/ApiError');

// All notification routes are protected by authMiddleware
router.use(authMiddleware);

/**
 * @route   GET /api/notifications
 * @desc    Get authenticated user's notifications and unread count
 * @access  Private
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit, 10) || 30;

    const data = await notificationService.getUserNotifications(userId, limit);

    return ApiResponse.success(res, data, 'User notifications retrieved successfully');
  })
);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a single notification as read
 * @access  Private
 */
router.patch(
  '/:id/read',
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const updated = await notificationService.markAsRead(notificationId, userId);
    if (!updated) {
      throw new NotFoundError('Notification not found');
    }

    return ApiResponse.success(res, updated, 'Notification marked as read');
  })
);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all unread notifications as read for current user
 * @access  Private
 */
router.patch(
  '/read-all',
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const count = await notificationService.markAllAsRead(userId);

    return ApiResponse.success(res, { markedCount: count }, `${count} notifications marked as read`);
  })
);

module.exports = router;
