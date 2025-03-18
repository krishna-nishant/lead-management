const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Link to User
  name: String,
  email: { type: String, required: true, unique: true },
  phone: String,
  score: { type: Number, default: 0 },
  category: { type: String, default: "cold" },
  assignedTo: { type: String, default: "unassigned" }, // Sales Rep ID
  actions: [{ action: String, timestamp: Date }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Lead", LeadSchema);
