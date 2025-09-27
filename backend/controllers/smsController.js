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

    if (phone.startsWith("0")) {
        phone = phone.substring(1);
    }

    if (!phone.startsWith("91")) {
        phone = "91" + phone;
    }

    const formatted = "+" + phone;

    return /^\+91[6-9]\d{9}$/.test(formatted) ? formatted : null;
}

export const sendBulkSms = async (req, res) => {
    console.log("🚀 Entered sendBulkSms API");

    try {
        const { fromDate, toDate, attendanceFilter, department, academicYear } = req.body;
        console.log("📥 Request body:", req.body);

        if (!req.file) {
            console.warn("⚠️ No Excel file uploaded");
            return res.status(400).json({ error: "Excel file required" });
        }
        console.log("📄 Excel file received:", req.file.originalname);

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        console.log(`📊 Total rows in Excel: ${sheetData.length}`);

        let sentRecords = [];
        let skippedRecords = [];

        let attendanceThreshold = null;
        if (attendanceFilter === "<50") attendanceThreshold = 50;
        else if (attendanceFilter === "<65") attendanceThreshold = 65;
        else if (attendanceFilter === "<75") attendanceThreshold = 75;
        console.log("🎯 Attendance threshold set to:", attendanceThreshold);

        for (let [index, row] of sheetData.entries()) {
            console.log(`\n🔹 Processing row ${index + 2}:`, row);

            const rollNo = row["Roll Number"] || row["Roll No"] || "";
            const name = row["Name"] || "";
            const excelYear = row["Year"] || "";
            const section = row["Section"] || "";
            const phone = row["Parent Mobile Number"] || row["Phone"] || "";
            const attendance = Number(row["Attendance"] || 0);

            if (attendanceThreshold !== null && attendance >= attendanceThreshold) {
                console.log(`⏩ Skipped due to attendance >= threshold: ${attendance}% >= ${attendanceThreshold}%`);
                skippedRecords.push({ row: index + 2, name, phone, reason: `Attendance >= ${attendanceThreshold}%` });
                continue;
            }

            try {
                const uploadRecord = await new Upload({
                    rollNo,
                    name,
                    phoneNumber: phone,
                    attendance,
                    year: excelYear,
                    section,
                    department,
                    fromDate,
                    toDate,
                    excelName: req.file.originalname,
                    academicYear,
                }).save();
                console.log("✅ Upload record saved:", uploadRecord._id);
            } catch (uploadErr) {
                console.error("❌ Failed to save Upload record:", uploadErr.message);
                skippedRecords.push({ row: index + 2, name, phone, reason: `Upload save error: ${uploadErr.message}` });
                continue;
            }

            const formattedPhone = formatPhoneNumber(phone);
            if (!formattedPhone) {
                console.warn(`⚠️ Invalid phone format: ${phone}`);
                skippedRecords.push({ row: index + 2, name, phone, reason: "Invalid phone format" });
                continue;
            }

            try {
                const ackLink = `${process.env.FRONTEND_URL}/ack/`;
                const message = `
Narayana Engineering College, Gudur
Dept. of ${department}

NReach Attendance Alert

Your ward ${name} (Roll No: ${rollNo || "N/A"}), ${excelYear} year, ${department} - ${section || "N/A"} student, has an attendance of ${attendance}% from ${fromDate} to ${toDate}.

🔴 Danger: Attendance critically low!

Please click this link to acknowledge: ${ackLink}

For further details, kindly contact HOD/Principal. Ph: +91 81219 79628
                `.trim();

                let smsRecord = await new Sms({
                    rollNo,
                    name,
                    phoneNumber: formattedPhone,
                    message,
                    attendance,
                    year: excelYear,
                    section,
                    department,
                    fromDate,
                    toDate,
                    academicYear,
                    smsSent: false,
                    status: "pending",
                }).save();

                smsRecord.ackLink = `${process.env.FRONTEND_URL}/ack/${smsRecord._id}`;
                smsRecord.message = smsRecord.message.replace(ackLink, smsRecord.ackLink);
                await smsRecord.save();
                console.log("📝 SMS record created:", smsRecord._id);

                try {
                    const twilioMsg = await client.messages.create({
                        body: `${smsRecord.message}\n\nPlease acknowledge: ${smsRecord.ackLink}`,
                        to: formattedPhone,
                        from: twilioPhone,
                    });

                    smsRecord.sid = twilioMsg.sid;
                    smsRecord.status = "sent";
                    smsRecord.smsSent = true;
                    await smsRecord.save();
                    console.log(`📤 SMS sent successfully to ${formattedPhone}, SID: ${twilioMsg.sid}`);
                    sentRecords.push(smsRecord);

                } catch (twilioErr) {
                    console.error(`❌ Twilio SMS failed for ${formattedPhone}:`, twilioErr.message);
                    smsRecord.status = "failed";
                    await smsRecord.save();
                    skippedRecords.push({ name, phone: formattedPhone, reason: `Twilio error: ${twilioErr.message}` });
                }

            } catch (rowErr) {
                console.error(`❌ SMS row processing failed for ${name}:`, rowErr.message);
                skippedRecords.push({ row: index + 2, name, phone, reason: `Row error: ${rowErr.message}` });
            }
        }

        console.log("\n📊 Summary:");
        console.log("✅ Sent records:", sentRecords.length);
        console.log("⏩ Skipped records:", skippedRecords.length);

        res.json({
            success: true,
            uploaded: sentRecords.length,
            sent: sentRecords.length,
            skipped: skippedRecords.length,
            skippedRecords,
        });

    } catch (err) {
        console.error("❌ sendBulkSms API error:", err.message, err.stack);
        res.status(500).json({ error: err.message });
    }
};


export const getSmsResults = async (req, res) => {
    try {
        console.log("🔍 Entered getSmsResults API");

        let query = {};
        const userRole = req.user.role;
        console.log("📝 User role:", userRole);

        if (userRole.startsWith("hod")) {
            const dept = userRole.replace("hod-", "").toUpperCase();
            query.department = dept;
            console.log("📂 Filtering by department:", dept);
        } else {
            console.log("📂 No department filter applied (operator or other roles)");
        }

        const sms = await Sms.find(query).sort({ createdAt: -1 });
        console.log(`📤 Sending ${sms.length} SMS records to frontend`);
        res.json(sms);
    } catch (err) {
        console.error("❌ Error in getSmsResults:", err);
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
