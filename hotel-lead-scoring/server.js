const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const leadRoutes = require("./routes/leads");
const authRoutes = require("./routes/auth");
const wishlistRoutes = require("./routes/wishlist");
const callRoutes = require("./routes/calls");

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
app.use("/audio", express.static(path.join(__dirname, "public/audio")));

// Enable CORS to allow frontend requests
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.get("/", (req, res) => res.send("Hotel Lead Scoring API Running"));
app.use("/api/leads", leadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/calls", callRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
