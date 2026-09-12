const firestoreService = require('../services/firestoreService');
const { NotFoundError, ForbiddenError } = require('../utils/ApiError');

/**
 * Reusable Resource Ownership Verification Middleware Factory.
 * Verifies that the resource identified by idParam in req.params belongs to req.user.id.
 * Admins bypass ownership checks automatically.
 * Attaches fetched resource object to req.resource to avoid duplicate reads.
 */
const verifyOwnership = (collectionName, ownerField = 'userId', idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[idParam];
      if (!resourceId) {
        return next(new NotFoundError(`${collectionName} resource ID parameter missing`));
      }

      const resource = await firestoreService.getById(collectionName, resourceId);
      if (!resource) {
        return next(new NotFoundError(`${collectionName} resource not found`));
      }

      // Admins bypass ownership checks — they can access any resource
      if (req.user && req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }

      const ownerId = resource[ownerField];
      if (String(ownerId) !== String(req.user?.id)) {
        return next(new ForbiddenError('You do not have permission to access this resource'));
      }

      // Attach resource to request object so controller avoids duplicate fetch
      req.resource = resource;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = verifyOwnership;
