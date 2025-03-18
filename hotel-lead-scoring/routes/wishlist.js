const express = require("express");
const router = express.Router();
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const generateEmail = require("../utils/generateEmail");
const sendEmail = require("../utils/sendEmail");

const hotelsFilePath = path.resolve(__dirname, "../public/hotels.json");

 // ✅ Check if `hotels.json` exists
 if (!fs.existsSync(hotelsFilePath)) {
    console.error("❌ hotels.json file is missing. Check path:", hotelsFilePath);
}

router.post("/add", async (req, res) => {
    const { userId, hotelId } = req.body;

    try {
        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: "User not found" });

        // ✅ Read hotels from JSON file
        const hotelsFilePath = path.join(__dirname, "../public/hotels.json");
        const hotelsData = JSON.parse(fs.readFileSync(hotelsFilePath, "utf8"));

        // ✅ Find the hotel by ID
        const hotel = hotelsData.find((h) => h.id === hotelId);
        if (!hotel) return res.status(404).json({ msg: "Hotel not found" });

        // ✅ Prevent duplicate entries
        if (user.wishlist.includes(hotelId)) {
            return res.status(400).json({ msg: "Hotel already in wishlist" });
        }

        user.wishlist.push(hotelId);
        await user.save();

        // ✅ AI-Generated Email Content
        const emailBody = await generateEmail(user, "added to wishlist", hotel.name);

        // ✅ Send Email with Nodemailer
        await sendEmail(user.email, `Still thinking about ${hotel.name}?`, emailBody);

        res.json({ msg: "Hotel added to wishlist", wishlist: user.wishlist });
    } catch (err) {
        console.error("❌ Error in wishlist add API:", err);
        res.status(500).json({ msg: "Server Error" });
    }
});



// ✅ Remove Hotel from Wishlist
router.post("/remove", async (req, res) => {
    const { userId, hotelId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }


        // 🔥 Convert hotelId to string for proper comparison
        user.wishlist = user.wishlist.filter(hotel => hotel && hotel.toString() !== hotelId.toString());

        await user.save(); // ✅ Ensure changes are saved
        return res.json({ msg: "Hotel removed from wishlist", wishlist: user.wishlist });
    } catch (error) {
        console.error("❌ Error in wishlist remove API:", error);
        return res.status(500).json({ msg: "Server error" });
    }
});


// ✅ Fetch wishlist for logged-in user
router.get("/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ msg: "User not found" });

        if (!fs.existsSync(hotelsFilePath)) {
            return res.status(500).json({ msg: "Hotels data not found" });
        }

        // Read hotels.json and return wishlist hotels
        fs.readFile(hotelsFilePath, "utf8", (err, data) => {
            if (err) {
                console.error("Error reading hotels.json:", err);
                return res.status(500).json({ msg: "Server Error" });
            }

            const allHotels = JSON.parse(data);
            const wishlistHotels = allHotels.filter(hotel => user.wishlist.includes(hotel.id));

            res.json(wishlistHotels);
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});


module.exports = router;
