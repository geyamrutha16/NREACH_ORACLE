import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed
    role: {
        type: String,
        enum: ["operator", "hod-cse", "hod-ece", "hod-eee", "hod-mech", "hod-civ"],
        required: true,
    },
});

export default mongoose.model("User", userSchema);
