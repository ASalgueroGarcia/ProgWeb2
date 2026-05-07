module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["./tests/setup.js"],
  testTimeout: 30000,
  collectCoverageFrom: ["src/**/*.js", "!src/index.js"],
  forceExit: true,
  detectOpenHandles: true
};
