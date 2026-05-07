const mongoose = require("mongoose");
const companySchema = new mongoose.Schema({
  name:  { type: String, required: true },
  cif:   { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  logo:  { type: String }
}, { timestamps: true });
module.exports = mongoose.model("Company", companySchema);
