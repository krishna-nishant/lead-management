const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
// const auth = require("../middleware/auth"); // 🔒 Protect Routes
const twilio = require("twilio");
// const nodemailer = require("nodemailer");

// Scoring System
const SCORE_RULES = {
    name: 5,
    email: 10,
    phone: 20,
    login: 5,
    view_hotel: 10,
    wishlist: 15,
    booking: 50,
};

// Sales reps mapping
const SALES_REPS = {
    hot: "rep1@example.com",  // Assign hot leads to this sales rep
    warm: "rep2@example.com", // Assign warm leads to this sales rep
    cold: "rep3@example.com"  // Assign cold leads to this sales rep
};

// Twilio credentials (Store these in .env)
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const client = twilio(accountSid, authToken);
const auth = require("../middleware/auth"); // Protect routes

// ✅ Get Leads for Logged-in User
router.get("/", auth, async (req, res) => {
    try {
        const leads = await Lead.find({ userId: req.user }).sort({ score: -1 });
        res.json(leads);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});
// Function to send WhatsApp message
const sendWhatsAppMessage = async (lead) => {
    try {
        const message = await client.messages.create({
            body: `Hello ${lead.name}, we noticed you're interested in our hotels. Let us know how we can assist you!`,
            from: `whatsapp:${whatsappNumber}`,
            to: `whatsapp:${lead.phone}`
        });
        console.log("✅ WhatsApp message sent:", message.sid);
    } catch (error) {
        console.error("❌ Error sending WhatsApp message:", error);
    }
};

// Function to determine Next Best Action
// Function to determine Next Best Action
const getNextBestAction = async (lead) => {
    if (lead.category === "hot") return "Call the lead immediately.";

    if (lead.category === "warm") {
        if (lead.phone) {
            return "Send WhatsApp message to lead."; // ✅ Don't send WhatsApp here
        }
        return "WhatsApp unavailable. Send a personalized email.";
    }

    return "Send an introductory email.";
};

// ✅ Add a New Lead (Only for Logged-in User)
// ✅ Add a New Lead (Only for Logged-in User)
router.post("/add", auth, async (req, res) => {
    const { name, email, phone } = req.body;

    try {
        let lead = await Lead.findOne({ email, userId: req.user });

        if (!lead) {
            lead = new Lead({
                userId: req.user,  // ✅ Associate lead with logged-in user
                name,
                email,
                phone,
                score: (name ? SCORE_RULES.name : 0) + (email ? SCORE_RULES.email : 0) + (phone ? SCORE_RULES.phone : 0),
                actions: [],
            });

            await lead.save();
        }

        res.status(201).json(lead);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


// Function to categorize leads based on score
const categorizeLead = (score) => {
    if (score >= 100) return "hot";   // High-priority leads
    if (score >= 75) return "warm";  // Medium-priority leads
    return "cold";                   // Low-priority leads
};

// ✅ Update Score for Logged-in User
// ✅ Update Score for Logged-in User
router.post("/update-score", auth, async (req, res) => {
    const { action } = req.body;

    try {
        let lead = await Lead.findOne({ userId: req.user });
        if (!lead) return res.status(404).json({ msg: "Lead not found" });

        // Update lead score
        lead.score += SCORE_RULES[action] || 0;
        lead.category = categorizeLead(lead.score); // Update category

        lead.actions.push({ action, timestamp: new Date() });

        await lead.save();
        res.json({ score: lead.score, category: lead.category, actions: lead.actions });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});



const nodemailer = require("nodemailer");

// Email Configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Send Email & WhatsApp When Score Exceeds Threshold
// ✅ Check Score for Logged-in User
router.post("/check-score", auth, async (req, res) => {
    try {
        let lead = await Lead.findOne({ userId: req.user });
        if (!lead) return res.status(404).json({ msg: "Lead not found" });

        let message = "No action taken.";
        
        if (lead.score > 100) {
            message = "Call the lead immediately.";
            console.log(`📞 Calling ${lead.name} (${lead.phone})`);
        } 
        else if (lead.score > 75) {
            if (lead.phone) {
                await sendWhatsAppMessage(lead);
                message = "WhatsApp message sent to lead.";
            } else {
                message = "WhatsApp unavailable. Send a personalized email.";
            }
        } 
        else if (lead.score > 50) {
            // Send Email
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: lead.email,
                subject: "Exclusive Hotel Discounts Just for You!",
                text: `Hi ${lead.name}, you've earned a special discount for your interest in our hotels. Book now!`,
            };
            await transporter.sendMail(mailOptions);
            message = "Email sent to high-score lead.";
        }

        res.json({
            score: lead.score,
            msg: message
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});




// Assign Sales Rep & Get Next Best Action
// Assign Sales Rep & Get Next Best Action
router.post("/assign-lead", async (req, res) => {
    const { email } = req.body;

    try {
        let lead = await Lead.findOne({ email });
        if (!lead) return res.status(404).json({ msg: "Lead not found" });

        // Assign sales rep based on lead category
        lead.assignedTo = SALES_REPS[lead.category] || "unassigned";
        const nextAction = await getNextBestAction(lead);

        await lead.save();
        res.json({ assignedTo: lead.assignedTo, nextAction });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


router.get("/all", async (req, res) => {
    try {
        const leads = await Lead.find().sort({ score: -1 }); // Sort by highest score
        res.json(leads);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
