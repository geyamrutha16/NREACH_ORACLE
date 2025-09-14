// models/Upload.js
import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        attendance: { type: Number, required: true },
        year: { type: String, required: true }, // I, II, III, IV
        excelName: { type: String }, // which excel uploaded
    },
    { timestamps: true }
);

export default mongoose.model("Upload", uploadSchema);
