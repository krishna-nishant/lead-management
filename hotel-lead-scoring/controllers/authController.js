const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { check, validationResult } = require("express-validator");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const SCORE_RULES = {
    name: 5,
    email: 10,
    phone: 20,
};

const categorizeUser = (score) => {
    if (score >= 100) return "hot";
    if (score >= 75) return "warm";
    return "cold";
};

const AuthController = {
    register: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { name, email, password, phone } = req.body;

        try {
            let user = await User.findOne({ email });
            if (user) return res.status(400).json({ msg: "User already exists" });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const initialScore = (name ? SCORE_RULES.name : 0) + 
                                 (email ? SCORE_RULES.email : 0) + 
                                 (phone ? SCORE_RULES.phone : 0);
            const category = categorizeUser(initialScore);

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

            const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
            res.json({ token, user });
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
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

            const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
            res.json({ token });
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
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