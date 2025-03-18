// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, unique: true, required: true },
//   password: { type: String, required: true },
//   score: { type: Number, default: 0 },
//   actions: [{ action: String, timestamp: Date }],
//   wishlist: [{ type: String }] // ✅ Store only hotel IDs (as strings)
// });

// module.exports = mongoose.model("User", UserSchema);


const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, sparse: true }, // Optional
  password: { type: String, required: true },
  
  // ✅ Score-related fields
  score: { type: Number, default: 0 },
  category: { type: String, default: "cold" }, // "cold", "warm", "hot"
  assignedTo: { type: String, default: "unassigned" }, // Sales Rep ID
  actions: [{ action: String, score: Number, timestamp: Date }],

  // ✅ Wishlist stored in DB instead of LocalStorage
  wishlist: [{ type: String }] ,

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
