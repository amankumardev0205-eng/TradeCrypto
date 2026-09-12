const firestoreService = require('../services/firestoreService');
const auditService = require('../services/auditService');

/**
 * Middleware to check if the authenticated user is an admin.
 * Verifies admin role, mandatory 2FA activation, and attaches an audit logger helper to req.
 */
const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await firestoreService.getById('users', req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin' || req.user.role === 'admin') {
      if (!user.twoFactorEnabled) {
        return res.status(403).json({ message: '2FA setup is mandatory for admin accounts. Please complete 2FA setup to access admin routes.' });
      }

      // Attach convenient audit logger helper function
      req.adminUser = user;
      req.logAdminAction = async (action, targetId = null, details = {}) => {
        return await auditService.logAction({
          action,
          adminId: user.id,
          adminEmail: user.email,
          targetId,
          details,
          ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        });
      };

      return next();
    }

    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  } catch (err) {
    console.error('Admin middleware error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = adminMiddleware;