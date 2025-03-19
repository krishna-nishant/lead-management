const express = require("express");
const router = express.Router();
const LeadController = require("../controllers/leadController");
const auth = require("../middleware/auth");

router.get("/", auth, LeadController.getLeads);
router.post("/send-booking-email", LeadController.sendBookingEmail);
router.post("/update-score", LeadController.updateScore);
router.post("/check-score", LeadController.checkScore);
router.post("/assign-lead", LeadController.assignLead);
router.get("/all", LeadController.getAllLeads);

module.exports = router;