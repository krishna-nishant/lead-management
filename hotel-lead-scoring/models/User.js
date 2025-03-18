const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  score: { type: Number, default: 0 },
  actions: [{ action: String, timestamp: Date }],
});

module.exports = mongoose.model("User", UserSchema);
