const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { check, validationResult } = require("express-validator");
// Import shared scoring configuration
const { SCORE_RULES, categorizeLead } = require("../config/score");

// Remove hardcoded fallback secret
const JWT_SECRET = process.env.JWT_SECRET;
// Define token expiration time as constant
const TOKEN_EXPIRY = '24h';

const AuthController = {
    register: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        // Check if JWT_SECRET is defined
        if (!JWT_SECRET) {
            console.error("JWT_SECRET is not defined in environment variables");
            return res.status(500).json({ msg: "Server configuration error" });
        }

        const { name, email, password, phone } = req.body;

        try {
            let user = await User.findOne({ email });
            if (user) return res.status(400).json({ msg: "User already exists" });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const initialScore = (name ? SCORE_RULES.name : 0) + 
                                 (email ? SCORE_RULES.email : 0) + 
                                 (phone ? SCORE_RULES.phone : 0);
            const category = categorizeLead(initialScore);

            user = new User({
                name,
                email,
                phone,
                password: hashedPassword,
                score: initialScore,
                category,
                actions: [{ action: "signup", score: initialScore, timestamp: new Date() }]
            });

            await user.save();

            const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
            res.json({ token, user });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Server Error" });
        }
    },

    login: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

            const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
            
            // Return user data with the token for consistency with register endpoint
            const userData = await User.findById(user.id).select("-password");
            
            // Add isAdmin flag based on email
            const isAdmin = email === "nishantkrishna2005@gmail.com";
            
            res.json({ 
                token, 
                user: {
                    ...userData._doc,
                    isAdmin
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Server Error" });
        }
    },

    getCurrentUser: async (req, res) => {
        try {
            const authHeader = req.header("Authorization");
            if (!authHeader) return res.status(401).json({ msg: "No token, authorization denied" });

            const token = authHeader.split(" ")[1];
            if (!token) return res.status(401).json({ msg: "Invalid token format" });

            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.id).select("-password");
            res.json(user);
        } catch (err) {
            console.error("Error in /me route:", err);
            res.status(500).json({ msg: "Server Error" });
        }
    }
};

module.exports = AuthController;