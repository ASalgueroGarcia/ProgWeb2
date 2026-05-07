require("dotenv").config();
const { httpServer } = require("./app");
const { connect } = require("./config/database");

const start = async () => {
  await connect();
  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start().catch(console.error);

const shutdown = async () => {
  console.log("Shutting down gracefully...");
  const mongoose = require("mongoose");
  const { Server } = require("socket.io");
  const { httpServer } = require("./app");
  await mongoose.connection.close();
  const io = new Server(httpServer);
  io.close();
  process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
