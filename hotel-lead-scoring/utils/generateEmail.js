/* const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const generateEmail = async (user, action, hotelName) => {
    const prompt = `Generate a personalized email for ${user.name} who ${action} the hotel '${hotelName}'. 
  Use a friendly tone and encourage them to take further action.`;

    try {
        const response = await axios.post(
            "https://api.perplexity.ai/chat/completions",
            {
                model: "sonar-pro", // Use "sonar-medium" or "sonar-small" if needed
                messages: [
                    {
                        role: "system",
                        content: "You are an AI email writer. Generate only the email content."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("❌ Error generating email:", error);
        return "We're sorry! We couldn't generate the email at this time.";
    }
};

module.exports = generateEmail; */




const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const generateEmail = async (user, action, hotelName) => {
    const prompt = `Generate a personalized email for ${user.name} who ${action} the hotel '${hotelName}'. 
    Use a friendly tone and encourage them to take further action.`;

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            { text: prompt }
                        ]
                    }
                ]
            },
            {
                headers: { "Content-Type": "application/json" },
            }
        );

        // Extract the text content from parts[0]
        const emailContent = response.data.candidates[0].content.parts[0].text;

        return emailContent.trim(); // Trim any leading/trailing spaces
    } catch (error) {
        console.error("❌ Error generating email:", error.response?.data || error.message);
        return "We're sorry! We couldn't generate the email at this time.";
    }
};

module.exports = generateEmail;
