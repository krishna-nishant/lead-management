const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, body) => {
  const mailOptions = {
    from: `"Hotel Lead Manager" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `<p>${body}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};


module.exports = sendEmail;