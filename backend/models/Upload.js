import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        attendance: { type: Number, required: true },
        year: { type: String, required: true },
        academicYear: { type: String, required: true },
        department: { type: String, required: true },
        section: { type: String },
        excelName: { type: String },
        fromDate: { type: String },
        toDate: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model("Upload", uploadSchema);
