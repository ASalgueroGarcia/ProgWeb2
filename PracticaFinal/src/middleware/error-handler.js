const { sendSlackError } = require("../services/logger.service");

module.exports = (err, req, res, next) => {
  const status = err.statusCode || 500;
  if (status >= 500) sendSlackError(err, req).catch(() => {});
  res.status(status).json({ status: "error", message: err.message || "Internal Server Error" });
};
