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
    phone = phone.replace(/\D/g, "");
    if (!phone.startsWith("91")) phone = "91" + phone;
    const formatted = "+" + phone;
    return /^\+91\d{10}$/.test(formatted) ? formatted : null;
}

export const sendBulkSms = async (req, res) => {
    try {
        const { year, fromDate, toDate } = req.body;

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
                Year,
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
                year,
                section: Section,
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

Your ward ${Name} with Roll No: ${RollNo || "N/A"} of ${Year} Year, CSE-${Section || "N/A"} is having attendance of ${attendance}% from ${fromDate} to ${toDate}. 

For further details, kindly contact HOD/Principal. 
Ph: 000-000-0000
      `.trim();

            // Save SMS record including rollNo
            let smsRecord = await new Sms({
                rollNo: RollNo, // ✅ Roll Number saved
                name: Name,
                phoneNumber: formattedPhone,
                message,
                attendance,
                year,
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

/*
import Sms from "../models/Sms.js";
import Upload from "../models/Upload.js";
import twilio from "twilio";
import xlsx from "xlsx";

const client = twilio(
    "ACfcabebfbe352c486b188820fed5a5989",
    "11f58d50bab593880fc5fa8a9e78274f"
);
const twilioPhone = "+19785414292";

// 📂 Send Bulk SMS

// ✅ Helper to sanitize & validate phone numbers
function formatPhoneNumber(num) {
    if (!num) return null;

    let phone = String(num).trim();

    // Remove everything except digits
    phone = phone.replace(/\D/g, "");

    // Ensure it starts with 91 (India)
    if (!phone.startsWith("91")) {
        phone = "91" + phone;
    }

    const formatted = "+" + phone;

    // Must be in E.164 and have 10 digits after 91
    if (!/^\+91\d{10}$/.test(formatted)) {
        return null; // invalid number
    }

    return formatted;
}

export const sendBulkSms = async (req, res) => {
    try {
        const { year, message } = req.body;
        console.log(`📅 Year received: ${year}, Message: ${message}`);

        if (!req.file) {
            console.warn("⚠️ No Excel file uploaded");
            return res.status(400).json({ error: "Excel file is required" });
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log(`📊 Parsed ${sheetData.length} rows`);

        let sentRecords = [];
        let skippedRecords = [];

        for (let row of sheetData) {
            const { Name, Phone, Attendance } = row;
            const attendance = Number(Attendance);

            // Save Upload always
            await new Upload({
                name: Name,
                phoneNumber: Phone,
                attendance,
                year,
                excelName: req.file.originalname,
            }).save();

            if (isNaN(attendance)) {
                console.warn(`⚠️ Invalid attendance for ${Name}`);
                continue;
            }

            // Only send if < 75
            if (attendance < 75) {
                const formattedPhone = formatPhoneNumber(Phone);
                if (!formattedPhone) {
                    skippedRecords.push({ name: Name, phone: Phone, reason: "Invalid phone" });
                    continue;
                }

                // Save SMS first to get _id
                let smsRecord = await new Sms({
                    name: Name,
                    phoneNumber: formattedPhone,
                    message: `Attendance: ${attendance}% - ${message}`,
                    attendance,
                    year,
                    smsSent: false,
                    status: "pending",
                }).save();

                // Generate ack link
                smsRecord.ackLink = `http://localhost:3000/ack/${smsRecord._id}`;
                await smsRecord.save();

                // Send SMS
                try {
                    const twilioMsg = await client.messages.create({
                        body: `Dear ${Name}, your attendance is ${attendance}%. ${message} Please acknowledge: ${smsRecord.ackLink}`,
                        to: formattedPhone,
                        from: twilioPhone,
                    });

                    // Update SMS record
                    smsRecord.sid = twilioMsg.sid;
                    smsRecord.status = "sent";
                    smsRecord.smsSent = true;
                    await smsRecord.save();

                    sentRecords.push(smsRecord);
                } catch (err) {
                    smsRecord.status = "failed";
                    await smsRecord.save();
                    skippedRecords.push({ name: Name, phone: formattedPhone, reason: "SMS failed" });
                }
            } else {
                skippedRecords.push({ name: Name, phone: Phone, reason: "Attendance >= 75" });
            }
        }

        // ✅ Send response after processing all rows
        res.json({
            success: true,
            uploaded: sheetData.length,
            sent: sentRecords.length,
            skipped: skippedRecords.length,
            skippedRecords,
        });

    } catch (error) {
        console.error("❌ Error in sendBulkSms:", error.message);
        res.status(500).json({ error: "Failed to process bulk SMS" });
    }
};
*/

/*
export const sendBulkSms = async (req, res) => {
    try {
        const { year, message } = req.body;
        console.log(`📅 Year received: ${year}, Message: ${message}`);
 
        if (!req.file) {
            console.warn("⚠️ No Excel file uploaded");
            return res.status(400).json({ error: "Excel file is required" });
        }
 
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
 
        console.log(`📊 Parsed ${sheetData.length} rows`);
 
        let sentRecords = [];
        let skippedRecords = [];
 
        for (let row of sheetData) {
            const { Name, Phone, Attendance } = row;
            const attendance = Number(Attendance);
 
            // ✅ Save Upload always
            const uploadRecord = new Upload({
                name: Name,
                phoneNumber: Phone,
                attendance,
                year,
                excelName: req.file.originalname,
            });
            await uploadRecord.save();
 
            if (isNaN(attendance)) {
                console.warn(`⚠️ Invalid attendance for ${Name}`);
                continue;
            }
 
            // ✅ Only send if < 75
            if (attendance < 75) {
                // Format phone
                const formattedPhone = formatPhoneNumber(Phone);
                console.log(`📞 Original: ${Phone} → Formatted: ${formattedPhone}`);
 
                if (!formattedPhone) {
                    console.warn(`❌ Skipping invalid phone: ${Phone}`);
                    skippedRecords.push({ name: Name, phone: Phone, reason: "Invalid phone" });
                    continue;
                }
 
                let smsRecord = new Sms({
                    name: Name,
                    phoneNumber: formattedPhone, // store sanitized
                    message: `Attendance: ${attendance}% - ${message}`,
                    attendance,
                    year,
                    smsSent: false,
                    status: "pending",
                });
 
                try {
                    const twilioMsg = await client.messages.create({
                        body: `Dear ${Name}, your attendance is ${attendance}%. ${message}`,
                        to: formattedPhone,
                        from: twilioPhone,
                    });
 
                    smsRecord.sid = twilioMsg.sid;
                    smsRecord.status = "sent";
                    smsRecord.smsSent = true;
                    console.log(`✅ SMS sent → ${formattedPhone}`);
                    sentRecords.push(smsRecord);
                } catch (err) {
                    console.error(`❌ Failed SMS → ${formattedPhone}:`, err.message);
                    smsRecord.status = "failed";
                }
 
                await smsRecord.save();
            } else {
                console.log(`✅ Attendance >= 75 → Skipping SMS for ${Name}`);
                skippedRecords.push({ name: Name, phone: Phone, reason: "Attendance >= 75" });
            }
        }
 
        res.json({
            success: true,
            uploaded: sheetData.length,
            sent: sentRecords.length,
            skipped: skippedRecords.length,
            skippedRecords,
        });
    } catch (error) {
        console.error("❌ Error in sendBulkSms:", error.message);
        res.status(500).json({ error: "Failed to process bulk SMS" });
    }
};
*/

/*
// 📊 Get all SMS
export const getSmsResults = async (req, res) => {
    try {
        console.log("🚀 /results API hit");
        console.log("📥 Fetching SMS results from DB...");

        const sms = await Sms.find().sort({ createdAt: -1 });

        console.log(`📊 Found ${sms.length} records in DB`);
        res.json(sms);
    } catch (err) {
        console.error("❌ getSmsResults error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// ✅ Acknowledge SMS
export const acknowledgeSms = async (req, res) => {
    try {
        console.log("🚀 /ack API hit");

        // ✅ Get the SMS ID from the URL params
        const smsId = req.params.smsId;
        console.log(`📥 Acknowledgment received for SMS ID: ${smsId}`);

        // ✅ Find the SMS by its unique ID
        const sms = await Sms.findById(smsId);
        if (!sms) {
            console.warn("⚠️ Record not found in DB for ID:", smsId);
            return res.status(404).json({ success: false, message: "Record not found." });
        }

        // ✅ Mark as seen
        sms.seen = true;
        await sms.save();

        console.log(`👀 Record updated as seen → ID=${sms._id}`);
        res.json({
            success: true,
            message: "Acknowledgment recorded. Thank you!",
            phoneNumber: sms.phoneNumber
        });
    } catch (err) {
        console.error("❌ Error in acknowledgeSms:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/*
export const acknowledgeSms = async (req, res) => {
    try {
        console.log("🚀 /ack API hit");

        const phoneNumber = decodeURIComponent(req.params.phoneNumber);
        console.log(`📥 Acknowledgment received for ${phoneNumber}`);

        const sms = await Sms.findById(smsId);
        if (!sms) {
            console.warn("⚠️ Record not found in DB for:", phoneNumber);
            return res.status(404).json({ success: false, message: "Record not found." });
        }

        sms.seen = true; // ✅ now valid
        await sms.save();

        console.log(`👀 Record updated as seen → ID=${sms._id}`);
        res.json({ success: true, message: "Acknowledgment recorded. Thank you!" });
    } catch (err) {
        console.error("❌ Error in acknowledgeSms:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
*/

