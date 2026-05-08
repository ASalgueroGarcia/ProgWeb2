const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  company:   { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  validated: { type: Boolean, default: false },
  validationCode: String,
  // role ahora distingue 'admin' y 'guest'
  role:      { type: String, enum: ["admin", "guest", "user"], default: "admin" },
  deleted:   { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model("User", userSchema);