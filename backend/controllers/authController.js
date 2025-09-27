import User from "../models/User.js"; // adjust path if needed
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        console.log("🔎 Entered:", username, password);
        console.log("🔎 Found user:", user);

        if (!user) return res.status(400).json({ success: false, message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("🔎 Password match:", isMatch);

        if (!isMatch) return res.status(400).json({ success: false, message: "Password incorrect" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

        return res.json({ success: true, message: "Login successful", token, role: user.role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
