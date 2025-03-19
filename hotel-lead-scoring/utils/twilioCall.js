const twilio = require("twilio");
const dotenv = require("dotenv");

dotenv.config();

const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const makeCall = async (lead, audioUrl) => {
    try {
        const call = await client.calls.create({
            to: +919241835483,
            from: process.env.TWILIO_PHONE_NUMBER,
            url: audioUrl, // ✅ Short URL now!
        });

        console.log(`✅ Call placed to ${lead.phone}: ${call.sid}`);
    } catch (error) {
        console.error("❌ Error placing call:", error);
    }
};

module.exports = makeCall;
