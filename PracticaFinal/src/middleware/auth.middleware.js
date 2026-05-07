const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next(new AppError("No token provided", 401));
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "test_secret");
    const user = await User.findById(decoded.id).populate("company");
    if (!user) return next(new AppError("User not found", 401));
    req.user = user;
    next();
  } catch (err) {
    next(new AppError("Invalid token", 401));
  }
};
