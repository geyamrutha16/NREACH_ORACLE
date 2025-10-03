import mongoose from "mongoose";

const smsSchema = new mongoose.Schema(
    {
        rollNo: { type: String, required: true },
        name: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        message: { type: String, required: true },
        attendance: { type: Number, required: true },
        year: { type: String, required: true },
        academicYear: { type: String, required: true },
        section: { type: String, required: true },
        department: { type: String, required: true },
        fromDate: { type: String, required: true },
        toDate: { type: String, required: true },
        sid: { type: String },
        status: {
            type: String,
            enum: ["pending", "queued", "sent", "delivered", "failed", "undelivered"],
            default: "pending",
        },
        smsSent: { type: Boolean, default: false },
        seen: { type: Boolean, default: false },
        ackLink: { type: String },
        errorMessage: { type: String }
    },
    { timestamps: true }
);

export default mongoose.model("Sms", smsSchema);
/*
const smsSchema = new mongoose.Schema(
    {
        rollNo: { type: String, required: true },
        name: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        message: { type: String, required: true },
        attendance: { type: Number, required: true },
        year: { type: String, required: true },
        academicYear: { type: String, required: true },
        section: { type: String, required: true },
        department: { type: String, required: true },
        fromDate: { type: String, required: true },
        toDate: { type: String, required: true },
        sid: { type: String },
        status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
        smsSent: { type: Boolean, default: false },
        seen: { type: Boolean, default: false },
        ackLink: { type: String },
        errorMessage: { type: String }
    },
    { timestamps: true }
);

export default mongoose.model("Sms", smsSchema);
*/