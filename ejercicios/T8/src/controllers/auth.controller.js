//src/controllers/auth.controller.js
import User from '../models/user.model.js';
import { encrypt, compare } from '../utils/handlePassword.js';
import { tokenSign } from '../utils/handleJwt.js';
import { handleHttpError } from '../utils/handleError.js';

export const registerCtrl = async (req, res) => {
  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) {
      handleHttpError(res, 'EMAIL_ALREADY_EXISTS', 400);
      return;
    }

    const password = await encrypt(req.body.password);
    const user = await User.create({ ...req.body, password });
    user.set('password', undefined, { strict: false });

    res.status(201).json({ token: tokenSign(user), user });
  } catch (err) {
    handleHttpError(res, 'ERROR_REGISTER_USER');
  }
};

export const loginCtrl = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      handleHttpError(res, 'USER_NOT_EXISTS', 401);
      return;
    }

    const check = await compare(password, user.password);
    if (!check) {
      handleHttpError(res, 'INVALID_PASSWORD', 401);
      return;
    }

    user.set('password', undefined, { strict: false });
    res.status(201).json({ token: tokenSign(user), user });
  } catch (err) {
    handleHttpError(res, 'ERROR_LOGIN_USER');
  }
};

export const getMeCtrl = (req, res) => {
  res.json({ user: req.user });
};