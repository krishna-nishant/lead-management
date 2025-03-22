const express = require("express");
const router = express.Router();
const User = require("../models/User"); // MongoDB Lead Model
const makeCall = require("../utils/twilioCall");
const generateVoice = require("../utils/generateVoice");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// 📞 Call high-score leads - Admin only endpoint
router.post("/trigger-calls", [auth, admin], async (req, res) => {
    try {
        const highScoreLeads = await User.find({ score: { $gt: 150 } });

        if (highScoreLeads.length === 0) {
            return res.json({ msg: "No high-score leads to call." });
        }

        for (const lead of highScoreLeads) {
            const message = `Hello ${lead.name}! This is Hotel Bot with an exclusive offer just for you. 
        Since you're one of our top guests, we have a **special luxury package** for your next stay at ${lead.lastViewedHotel}. 
        Enjoy **3 nights for the price of 2**, free breakfast, and a **complimentary spa session**. 
        
        Press **1** now to speak with our travel expert and claim this exclusive deal! 
        Press **2** if you'd like more time to decide. 
        
        We look forward to hosting you soon, ${lead.name}!`;

            const audioUrl = await generateVoice(message);
            if (!audioUrl) return res.status(500).json({ msg: "AI Voice Generation Failed" });

            const callSID = await makeCall(lead.phone, audioUrl);
            if (!callSID) return res.status(500).json({ msg: "Call Failed" });

            lead.lastCall = new Date();
            await lead.save();
        }

        res.json({ msg: "Calls placed successfully!" });
    } catch (error) {
        console.error("❌ Error triggering calls:", error);
        res.status(500).json({ msg: "Server Error" });
    }
});

module.exports = router;
