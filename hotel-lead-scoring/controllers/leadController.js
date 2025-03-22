const User = require("../models/User");
const twilio = require("twilio");
const generateEmail = require("../utils/generateEmail");
const sendEmail = require("../utils/sendEmail");
const sendWhatsAppMessage = require("../utils/sendWhatsapp");
// Import shared scoring configuration
const { SCORE_RULES, SALES_REPS, categorizeLead, getNextBestAction } = require("../config/score");

const LeadController = {
    getLeads: async (req, res) => {
        try {
            const leads = await User.find().sort({ score: -1 });
            res.json(leads);
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Server Error" });
        }
    },

    sendBookingEmail: async (req, res) => {
        const { userId, hotelName } = req.body;
        try {
            let user = await User.findById(userId);
            if (!user) return res.status(404).json({ msg: "User not found" });

            const emailBody = await generateEmail(user, "hotel booking", hotelName);
            await sendEmail(user.email, `Your Booking for ${hotelName} is Confirmed`, emailBody);

            res.json({ msg: "Booking confirmation email sent!" });
        } catch (err) {
            console.error("❌ Error sending booking email:", err);
            res.status(500).json({ msg: "Failed to send email." });
        }
    },

    updateScore: async (req, res) => {
        const { userId, action } = req.body;
        try {
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ msg: "User not found" });

            const scoreToAdd = SCORE_RULES[action] || 0;

            user.score += scoreToAdd;
            user.category = categorizeLead(user.score);
            user.actions.push({ action, score: scoreToAdd, timestamp: new Date() });

            await user.save();
            res.json({ msg: "Score updated", score: user.score, category: user.category });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Server Error" });
        }
    },

    checkScore: async (req, res) => {
        try {
            const users = await User.find();
            let messages = [];
            const now = new Date();

            for (let user of users) {
                let message = "No action taken.";
                let alertType = null;

                if (user.score >= 100) {
                    message = `📞 Calling ${user.name} (${user.phone})`;
                    console.log(message);
                    alertType = 'call';
                } else if (user.score >= 75) {
                    if (user.phone) {
                        await sendWhatsAppMessage(user.phone, `Hey ${user.name}, you're one step away from booking your dream stay! Grab your offer now.`);
                        message = `📩 WhatsApp message sent to ${user.name}`;
                        alertType = 'whatsapp';
                    } else {
                        const emailSubject = "Special Offer for Valued Customers";
                        const emailBody = `Hi ${user.name}, 

We noticed your interest in our hotels and wanted to reach out with a special offer.

As a valued customer, you're eligible for a 15% discount on your next booking at any of our premium hotels.

This offer is valid for the next 7 days, so don't miss out!

Best regards,
The Hotel Team`;

                        await sendEmail(user.email, emailSubject, emailBody);
                        message = `📧 WhatsApp unavailable. Email sent to ${user.name}.`;
                        alertType = 'email';
                    }
                } else if (user.score >= 50) {
                    const emailSubject = "Exclusive Hotel Discounts Just for You!";
                    const emailBody = `Hi ${user.name}, you've earned a special discount. Book now!`;

                    await sendEmail(user.email, emailSubject, emailBody);
                    message = `📧 Email sent to ${user.name}`;
                    alertType = 'email';
                }

                if (alertType) {
                    user.lastAlert = now;
                    user.alertHistory.push({
                        type: alertType,
                        timestamp: now
                    });
                    await user.save();
                }

                messages.push(message);
            }

            res.json({ msg: messages });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Server Error" });
        }
    },

    assignLead: async (req, res) => {
        try {
            let user = await User.findById(req.body.userId);
            if (!user) return res.status(404).json({ msg: "User not found" });

            user.assignedTo = SALES_REPS[user.category] || "unassigned";
            const nextAction = await getNextBestAction(user);

            await user.save();
            res.json({ assignedTo: user.assignedTo, nextAction });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Server Error" });
        }
    },

    getAllLeads: async (req, res) => {
        try {
            const users = await User.find().sort({ score: -1 });
            res.json(users);
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Server Error" });
        }
    }
};

module.exports = LeadController;