const router = require("express").Router();
router.use("/user", require("./user.routes"));
router.use("/client",       require("./client.routes"));
router.use("/project",      require("./project.routes"));
router.use("/deliverynote", require("./deliverynote.routes"));
module.exports = router;
