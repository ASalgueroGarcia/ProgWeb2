//src/middleware/session.middleware.js
import User from '../models/user.model.js';
import { verifyToken } from '../utils/handleJwt.js';
import { handleHttpError } from '../utils/handleError.js';

const authMiddleware = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      handleHttpError(res, 'NOT_TOKEN', 401);
      return;
    }

    const token = req.headers.authorization.split(' ').pop();
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      handleHttpError(res, 'INVALID_TOKEN', 401);
      return;
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      handleHttpError(res, 'USER_NOT_FOUND', 401);
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    handleHttpError(res, 'NOT_SESSION', 401);
  }
};

export default authMiddleware;