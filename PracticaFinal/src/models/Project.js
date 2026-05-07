const mongoose = require("mongoose");
const projectSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  company:     { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  client:      { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
  name:        { type: String, required: true },
  projectCode: { type: String, required: true },
  address:     { street: String, number: String, postal: String, city: String, province: String },
  email:       String,
  notes:       String,
  active:      { type: Boolean, default: true },
  deleted:     { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model("Project", projectSchema);
