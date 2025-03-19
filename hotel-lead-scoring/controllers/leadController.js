const Lead = require("../models/Lead");
const User = require("../models/User");
const twilio = require("twilio");
const generateEmail = require("../utils/generateEmail");
const sendEmail = require("../utils/sendEmail");
const sendWhatsAppMessage = require("../utils/sendWhatsapp");

const SCORE_RULES = {
    name: 5,
    email: 10,
    phone: 20,
    view_hotel: 10,
    wishlist: 15,
    booking: 50,
};

const SALES_REPS = {
    hot: "rep1@example.com",
    warm: "rep2@example.com",
    cold: "rep3@example.com"
};

const categorizeLead = (score) => {
    if (score >= 100) return "hot";
    if (score >= 75) return "warm";
    return "cold";
};

const getNextBestAction = async (lead) => {
    if (lead.category === "hot") return "Call the lead immediately.";
    if (lead.category === "warm") {
        if (lead.phone) {
            return "Send WhatsApp message to lead.";
        }
        return "WhatsApp unavailable. Send a personalized email.";
    }
    return "Send an introductory email.";
};

const LeadController = {
    getLeads: async (req, res) => {
        try {
            const leads = await User.find().sort({ score: -1 });
            res.json(leads);
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
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

            const scoreMapping = { wishlist: 15, booking: 50 };
            const scoreToAdd = scoreMapping[action] || 0;

            user.score += scoreToAdd;
            user.category = categorizeLead(user.score);
            user.actions.push({ action, score: scoreToAdd, timestamp: new Date() });

            await user.save();
            res.json({ msg: "Score updated", score: user.score, category: user.category });
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    },

    checkScore: async (req, res) => {
        try {
            const users = await User.find();
            let messages = [];

            for (let user of users) {
                let message = "No action taken.";

                if (user.score > 100) {
                    message = `📞 Calling ${user.name} (${user.phone})`;
                    console.log(message);
                } else if (user.score > 75) {
                    if (user.phone) {
                        await sendWhatsAppMessage(user.phone, `Hey ${user.name}, you’re one step away from booking your dream stay! Grab your offer now.`);
                        message = `📩 WhatsApp message sent to ${user.name}`;
                    } else {
                        message = `📧 WhatsApp unavailable. Sending email to ${user.name}.`;
                    }
                } else if (user.score > 50) {
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
            res.status(500).send("Server Error");
        }
    },

    getAllLeads: async (req, res) => {
        try {
            const users = await User.find().sort({ score: -1 });
            res.json(users);
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    }
};

module.exports = LeadController;