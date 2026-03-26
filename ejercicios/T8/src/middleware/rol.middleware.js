//src/middleware/rol.middleware.js
import { handleHttpError } from '../utils/handleError.js';

const checkRol = (role) => (req, res, next) => {
  try {
    if (req.user.role !== role) {
      handleHttpError(res, 'NOT_ALLOWED', 403);
      return;
    }
    next();
  } catch (err) {
    handleHttpError(res, 'ERROR_PERMISSIONS', 403);
  }
};

export default checkRol;