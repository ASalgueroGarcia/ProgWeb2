// src/utils/handleError.js

export const handleHttpError = (res, message, code = 500) => {
    res.status(code).json({ error: message });
};