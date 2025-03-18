const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");


const app = express();
app.use(express.json());

// Enable CORS to allow frontend requests
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.get("/", (req, res) => res.send("Hotel Lead Scoring API Running"));
const leadRoutes = require("./routes/leads");
app.use("/api/leads", leadRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
