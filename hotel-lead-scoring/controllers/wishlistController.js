const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const generateEmail = require("../utils/generateEmail");
const sendEmail = require("../utils/sendEmail");

const hotelsFilePath = path.resolve(__dirname, "../public/hotels.json");

const WishlistController = {
    addToWishlist: async (req, res) => {
        const { userId, hotelId } = req.body;

        try {
            let user = await User.findById(userId);
            if (!user) return res.status(404).json({ msg: "User not found" });

            const hotelsFilePath = path.join(__dirname, "../public/hotels.json");
            const hotelsData = JSON.parse(fs.readFileSync(hotelsFilePath, "utf8"));

            const hotel = hotelsData.find((h) => h.id === hotelId);
            if (!hotel) return res.status(404).json({ msg: "Hotel not found" });

            if (user.wishlist.includes(hotelId)) {
                return res.status(400).json({ msg: "Hotel already in wishlist" });
            }

            user.wishlist.push(hotelId);
            await user.save();
            res.json({ msg: "Hotel added to wishlist", wishlist: user.wishlist });
            
            const emailBody = await generateEmail(user, "added to wishlist", hotel.name);
            await sendEmail(user.email, `Still thinking about ${hotel.name}?`, emailBody);

        } catch (err) {
            console.error("❌ Error in wishlist add API:", err);
            res.status(500).json({ msg: "Server Error" });
        }
    },

    removeFromWishlist: async (req, res) => {
        const { userId, hotelId } = req.body;

        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ msg: "User not found" });
            }

            user.wishlist = user.wishlist.filter(hotel => hotel && hotel.toString() !== hotelId.toString());

            await user.save();
            return res.json({ msg: "Hotel removed from wishlist", wishlist: user.wishlist });
        } catch (error) {
            console.error("❌ Error in wishlist remove API:", error);
            return res.status(500).json({ msg: "Server error" });
        }
    },

    getWishlist: async (req, res) => {
        try {
            const user = await User.findById(req.params.userId);
            if (!user) return res.status(404).json({ msg: "User not found" });

            if (!fs.existsSync(hotelsFilePath)) {
                return res.status(500).json({ msg: "Hotels data not found" });
            }

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
    }
};

module.exports = WishlistController;