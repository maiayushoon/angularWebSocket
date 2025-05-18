import User from "../models/User.js";
import bcrypt from "bcrypt";

export const signUp = async (req, res) => {
    try {
        const { email, password, username } = req.body;
console.log(req.body, "req.body")
        // Validate input
        if (!email || !password || !username) {
            return res.status(400).json({ message: "Email, username, and password are required" });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username already in use" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            email,
            username,
            password: hashedPassword,
        });

        // Save user
        await newUser.save();

        res.status(201).json({ message: "User created successfully" });

    } catch (error) {
        console.error("Error during sign-up:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
