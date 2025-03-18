const twilio = require("twilio");
const dotenv = require("dotenv");

dotenv.config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendWhatsAppMessage = async (to, message) => {
  try {
    await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`,
    });
    console.log(`✅ WhatsApp message sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending WhatsApp message:", error);
  }
};

module.exports = sendWhatsAppMessage;