const mongoose = require("mongoose");
const clientSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  name:    { type: String, required: true },
  cif:     { type: String, required: true },
  email:   String,
  phone:   String,
  address: { street: String, number: String, postal: String, city: String, province: String },
  deleted: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model("Client", clientSchema);
