const axios = require("axios");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary").v2;

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const generateVoice = async (lead) => {
    if (!process.env.ELEVENLABS_API_KEY) {
        console.error("❌ Missing ElevenLabs API Key. Check your .env file.");
        return null;
    }

    const message = `Hi ${lead.name}, this is Hotel Bot!  
        Enjoy 3 nights for the price of 2, free breakfast, and a spa session.  
        Press 1 to book now. Press 2 to decide later.`;

    try {
        const response = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/stream`,
            {
                text: message,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5,
                },
            },
            {
                headers: {
                    "xi-api-key": process.env.ELEVENLABS_API_KEY,
                    "Content-Type": "application/json",
                },
                responseType: "arraybuffer",
            }
        );

        // Save audio locally
        const fileName = `voice_${Date.now()}.mp3`;
        const audioPath = path.join(__dirname, "../public/audio", fileName);
        fs.writeFileSync(audioPath, response.data);

        console.log(`✅ Voice saved locally: ${audioPath}`);

        // ✅ Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(audioPath, {
            resource_type: "video", // Supports MP3
            folder: "hotel-audio",
        });

        console.log(`✅ Audio uploaded to Cloudinary: ${uploadResponse.secure_url}`);
        
        return uploadResponse.secure_url; // ✅ Twilio can now use this public URL
    } catch (error) {
        console.error("❌ Error generating voice:", error.response?.data || error.message);
        return null;
    }
};

module.exports = generateVoice;
