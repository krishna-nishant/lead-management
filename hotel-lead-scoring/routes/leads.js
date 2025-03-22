const express = require("express");
const router = express.Router();
const LeadController = require("../controllers/leadController");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Regular user routes (require authentication only)
router.get("/", auth, LeadController.getLeads);
router.post("/send-booking-email", auth, LeadController.sendBookingEmail);
router.post("/update-score", auth, LeadController.updateScore);

// Admin-only routes (require both authentication and admin privileges)
router.post("/check-score", [auth, admin], LeadController.checkScore);
router.post("/assign-lead", [auth, admin], LeadController.assignLead);
router.get("/all", [auth, admin], LeadController.getAllLeads);

module.exports = router;