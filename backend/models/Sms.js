import mongoose from "mongoose";

const smsSchema = new mongoose.Schema(
    {
        rollNo: { type: String, required: true },
        name: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        message: { type: String, required: true },
        attendance: { type: Number, required: true },
        year: { type: String, required: true },
        section: { type: String, required: true },
        sid: { type: String },
        status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
        smsSent: { type: Boolean, default: false },

        // ✅ Add seen field
        seen: { type: Boolean, default: false },

        // ✅ Store unique acknowledgment link
        ackLink: { type: String },
    },
    { timestamps: true }
);

const Sms = mongoose.model("Sms", smsSchema);
export default Sms;
