const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
const User = require("../models/User");
const twilio = require("twilio");

const generateEmail = require("../utils/generateEmail");
const sendEmail = require("../utils/sendEmail");

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const client = twilio(accountSid, authToken);
const auth = require("../middleware/auth"); // Protect routes

const sendWhatsAppMessage = require("../utils/sendWhatsapp");


// Scoring System
const SCORE_RULES = {
    name: 5,
    email: 10,
    phone: 20,
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

// Function to send WhatsApp message
/* const sendWhatsAppMessage = async (lead) => {
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
}; */

const nodemailer = require("nodemailer");

// Email Configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

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

const categorizeLead = (score) => {
    if (score >= 100) return "hot";
    if (score >= 75) return "warm";
    return "cold";
};


// ✅ Get Leads for Logged-in User
router.get("/", auth, async (req, res) => {
    try {
        const leads = await User.find().sort({ score: -1 }); // ✅ Users now act as leads
        res.json(leads);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});
router.post("/send-booking-email", async (req, res) => {
    const { userId, hotelName } = req.body;

    try {
        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: "User not found" });

        // ✅ Generate AI-powered Email Content
        const emailBody = await generateEmail(user, "hotel booking", hotelName);

        // ✅ Send Email using Nodemailer
        await sendEmail(user.email, `Your Booking for ${hotelName} is Confirmed`, emailBody);

        res.json({ msg: "Booking confirmation email sent!" });
    } catch (err) {
        console.error("❌ Error sending booking email:", err);
        res.status(500).json({ msg: "Failed to send email." });
    }
});
// ✅ Update User Score (Previously Lead Score)
router.post("/update-score", async (req, res) => {
    const { userId, action } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: "User not found" });

        // Define scoring logic
        const scoreMapping = { wishlist: 15, booking: 50 };
        const scoreToAdd = scoreMapping[action] || 0;

        user.score += scoreToAdd;
        user.category = categorizeLead(user.score); // ✅ Update category dynamically
        user.actions.push({ action, score: scoreToAdd, timestamp: new Date() });

        await user.save();

        res.json({ msg: "Score updated", score: user.score, category: user.category });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


// ✅ Check User Score & Send Notifications
router.post("/check-score", async (req, res) => {
    try {
        const users = await User.find(); // ✅ Fetch all users
        let messages = [];

        for (let user of users) {
            let message = "No action taken.";

            if (user.score > 100) {
                message = `📞 Calling ${user.name} (${user.phone})`;
                console.log(message);
            }
            else if (user.score > 75) {
                if (user.phone) {
                    // await sendWhatsAppMessage(user);
                    await sendWhatsAppMessage(
                        user.phone,
                        `Hey ${user.name}, you’re one step away from booking your dream stay! Grab your offer now.`
                    );
                    message = `📩 WhatsApp message sent to ${user.name}`;
                } else {
                    message = `📧 WhatsApp unavailable. Sending email to ${user.name}.`;
                }
            }
            else if (user.score > 50) {
                // Send Email
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: user.email,
                    subject: "Exclusive Hotel Discounts Just for You!",
                    text: `Hi ${user.name}, you've earned a special discount. Book now!`,
                };
                await transporter.sendMail(mailOptions);
                message = `📧 Email sent to ${user.name}`;
            }

            messages.push(message);
        }

        res.json({ msg: messages });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


// ✅ Assign Sales Rep & Get Next Best Action
// ❌ Remove `auth` so Admin Dashboard can access this freely
router.post("/assign-lead", async (req, res) => {
    try {
        let user = await User.findById(req.body.userId);
        if (!user) return res.status(404).json({ msg: "User not found" });

        user.assignedTo = SALES_REPS[user.category] || "unassigned";
        const nextAction = await getNextBestAction(user);

        await user.save();
        res.json({ assignedTo: user.assignedTo, nextAction });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


// ✅ Get All Users (Leads) Sorted by Score
router.get("/all", async (req, res) => {
    try {
        const users = await User.find().sort({ score: -1 }); // ✅ Users now act as leads
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


module.exports = router;
