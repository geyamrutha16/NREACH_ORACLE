import Sms from "../models/Sms.js";
import Upload from "../models/Upload.js";
import twilio from "twilio";
import xlsx from "xlsx";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

console.log("🔑 Account SID from:", process.env.TWILIO_ACCOUNT_SID);
console.log("🔑 Auth Token:", process.env.TWILIO_AUTH_TOKEN);
console.log("🔑 Twilio Phone:", process.env.TWILIO_PHONE_NUMBER);

function formatPhoneNumber(num) {
    if (!num) return null;

    let phone = String(num).trim();

    // Remove all non-digits
    phone = phone.replace(/\D/g, "");

    // Remove leading 0 if present
    if (phone.startsWith("0")) {
        phone = phone.substring(1);
    }

    // Ensure country code
    if (!phone.startsWith("91")) {
        phone = "91" + phone;
    }

    const formatted = "+" + phone;

    // Validate Indian mobile numbers (should start with 6-9 after +91)
    return /^\+91[6-9]\d{9}$/.test(formatted) ? formatted : null;
}

export const sendBulkSms = async (req, res) => {
    try {
        const { academicYear, fromDate, toDate } = req.body;

        if (!req.file) return res.status(400).json({ error: "Excel file required" });

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        let sentRecords = [];
        let skippedRecords = [];

        for (let row of sheetData) {
            const {
                "Roll Number": RollNo,
                Name,
                Year: excelYear,
                Section,
                "Parent Mobile Number": Phone,
                Attendance,
            } = row;

            const attendance = Number(Attendance);

            // Save upload record
            await new Upload({
                rollNo: RollNo,
                name: Name,
                phoneNumber: Phone,
                attendance,
                year: excelYear,            // from Excel
                academicYear, // user input
                fromDate,
                toDate,
                excelName: req.file.originalname,
            }).save();

            // Skip invalid attendance
            if (isNaN(attendance) || attendance >= 75) {
                skippedRecords.push({ name: Name, phone: Phone, reason: "Invalid or >= 75" });
                continue;
            }

            // Validate phone number
            const formattedPhone = formatPhoneNumber(Phone);
            if (!formattedPhone) {
                skippedRecords.push({ name: Name, phone: Phone, reason: "Invalid phone" });
                continue;
            }

            // Create SMS message
            const message = `
Narayana Engineering College, Gudur
Dept. of CSE

NReach Attendance Alert

Your ward ${Name} with Roll No: ${RollNo || "N/A"} of ${excelYear} Year, CSE-${Section || "N/A"} is having attendance of ${attendance}% from ${fromDate} to ${toDate}. 

For further details, kindly contact HOD/Principal. 
Ph: +91 81219 79628`.trim();

            // Save SMS record including rollNo
            let smsRecord = await new Sms({
                rollNo: RollNo, // ✅ Roll Number saved
                name: Name,
                phoneNumber: formattedPhone,
                message,
                attendance,
                year: excelYear,             // from Excel
                academicYear,
                section: Section,
                fromDate,
                toDate,
                smsSent: false,
                status: "pending",
            }).save();

            // Add acknowledgement link
            const ackLink = `${process.env.FRONTEND_URL}/ack/${smsRecord._id}`;
            smsRecord.ackLink = ackLink;
            await smsRecord.save();
            console.log("Frontend URL:", process.env.FRONTEND_URL);
            console.log("Generated Ack Link:", ackLink);

            // Send SMS via Twilio
            try {
                // In your sendBulkSms function, add:
                console.log("📞 Processing:", Name, "- Phone:", Phone, "- Formatted:", formattedPhone);

                if (!formattedPhone) {
                    console.log("❌ Invalid phone format:", Phone);
                    skippedRecords.push({ name: Name, phone: Phone, reason: "Invalid phone format" });
                    continue;
                }
                const twilioMsg = await client.messages.create({
                    body: `${message}\n\nPlease acknowledge: ${ackLink}`,
                    to: formattedPhone,
                    from: twilioPhone,
                });

                smsRecord.sid = twilioMsg.sid;
                smsRecord.status = "sent";
                smsRecord.smsSent = true;
                await smsRecord.save();

                sentRecords.push(smsRecord);
            } catch (err) {
                console.error("❌ SMS sending failed:", err?.message || err);

                smsRecord.status = "failed";

                try {
                    await smsRecord.save();
                    console.log(`📄 Saved failed SMS record for ${Name} (${formattedPhone})`);
                } catch (saveErr) {
                    console.error("💾 Error saving failed SMS record:", saveErr?.message || saveErr);
                }

                skippedRecords.push({
                    name: Name,
                    phone: formattedPhone,
                    reason: `SMS failed - ${err?.message || "Unknown error"}`
                });

                console.log("⚠️ Skipped Records so far:", skippedRecords);
            }

        }

        res.json({
            success: true,
            uploaded: sheetData.length,
            sent: sentRecords.length,
            skipped: skippedRecords.length,
            skippedRecords,
        });
    } catch (err) {
        console.error("❌ sendBulkSms error:", err);
        res.status(500).json({ error: "Failed to process bulk SMS" });
        console.error(`❌ Twilio error for ${formattedPhone}:`, err.message, err.code);
        smsRecord.status = "failed";
        await smsRecord.save();
        skippedRecords.push({ name: Name, phone: formattedPhone, reason: err.message });
    }
};

export const getSmsResults = async (req, res) => {
    try {
        const sms = await Sms.find().sort({ createdAt: -1 });
        console.log("Sending SMS results:", sms);
        res.json(sms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const acknowledgeSms = async (req, res) => {
    try {
        const smsId = req.params.smsId;
        const sms = await Sms.findById(smsId);
        if (!sms) return res.status(404).json({ success: false, message: "Record not found." });

        sms.seen = true;
        await sms.save();
        res.json({ success: true, message: "Acknowledgment recorded. Thank you!", phoneNumber: sms.phoneNumber });
    } catch (err) {
        console.error("❌ acknowledgeSms error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Add this function to your smsController.js
export const getSmsById = async (req, res) => {
    try {
        const smsId = req.params.smsId;
        console.log("📥 Fetching SMS record for ID:", smsId);

        const sms = await Sms.findById(smsId);
        if (!sms) {
            console.warn("⚠️ SMS record not found for ID:", smsId);
            return res.status(404).json({ success: false, message: "SMS record not found." });
        }

        console.log("✅ SMS record found:", sms);
        res.json({
            success: true,
            data: sms
        });
    } catch (err) {
        console.error("❌ getSmsById error:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
