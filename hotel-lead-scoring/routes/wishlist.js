const express = require("express");
const router = express.Router();
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

const hotelsFilePath = path.resolve(__dirname, "../public/hotels.json");

 // ✅ Check if `hotels.json` exists
 if (!fs.existsSync(hotelsFilePath)) {
    console.error("❌ hotels.json file is missing. Check path:", hotelsFilePath);
}

// ✅ Add Hotel to Wishlist
router.post("/add", async (req, res) => {
    const { userId, hotelId } = req.body;

    try {
        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: "User not found" });

        // ✅ Prevent duplicate entries
        if (user.wishlist.includes(hotelId)) {
            return res.status(400).json({ msg: "Hotel already in wishlist" });
        }

        user.wishlist.push(hotelId);
        await user.save();

        res.json({ msg: "Hotel added to wishlist", wishlist: user.wishlist });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});



// ✅ Remove Hotel from Wishlist
router.post("/remove", async (req, res) => {
    const { userId, hotelId } = req.body;

    try {
        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: "User not found" });

        user.wishlist = user.wishlist.filter(id => id !== hotelId);
        await user.save();

        res.json({ msg: "Hotel removed from wishlist", wishlist: user.wishlist });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
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
