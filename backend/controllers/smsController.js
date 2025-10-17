import oracledb from "oracledb";
import twilio from "twilio";
import xlsx from "xlsx";
import dotenv from "dotenv";
dotenv.config();

// Twilio setup
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Oracle setup
async function getConnection() {
    return await oracledb.getConnection({
        user: process.env.ORACLE_USER,
        password: process.env.ORACLE_PASSWORD,
        connectionString: process.env.ORACLE_CONNECTION_STRING,
    });
}

function formatPhoneNumber(num) {
    if (!num) return null;
    let phone = String(num).trim().replace(/\D/g, "");
    if (phone.startsWith("0")) phone = phone.substring(1);
    if (!phone.startsWith("91")) phone = "91" + phone;
    const formatted = "+" + phone;
    return /^\+91[6-9]\d{9}$/.test(formatted) ? formatted : null;
}

export const sendBulkSms = async (req, res) => {
    console.log("🚀 Entered sendBulkSms API");
    let connection;

    try {
        const { fromDate, toDate, attendanceFilter, department, academicYear } = req.body;
        console.log("📥 Request body:", req.body);

        if (!req.file) return res.status(400).json({ error: "Excel file required" });
        console.log("📄 Excel file received:", req.file.originalname);

        const workbook = xlsx.readFile(req.file.path);
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        console.log(`📊 Total rows: ${sheetData.length}`);

        let sentRecords = [];
        let skippedRecords = [];

        let attendanceThreshold = null;
        if (attendanceFilter === "<50") attendanceThreshold = 50;
        else if (attendanceFilter === "<65") attendanceThreshold = 65;
        else if (attendanceFilter === "<75") attendanceThreshold = 75;

        connection = await getConnection();

        for (let [index, row] of sheetData.entries()) {
            console.log(`\n🔹 Processing row ${index + 2}:`, row);

            const rollNo = row["Roll Number"] || row["Roll No"] || "";
            const name = row["Name"] || "";
            const excelYear = row["Year"] || "";
            const section = row["Section"] || "";
            const phone = row["Parent Mobile Number"] || row["Phone"] || "";
            const attendance = Number(row["Attendance"] || 0);

            if (attendanceThreshold !== null && attendance >= attendanceThreshold) {
                console.log(`⏩ Skipped: Attendance ${attendance}% >= ${attendanceThreshold}%`);
                skippedRecords.push({ name, phone, reason: `Attendance >= ${attendanceThreshold}%` });
                continue;
            }

            try {
                await connection.execute(
                    `INSERT INTO UPLOADS (ROLL_NO, NAME, PHONE_NUMBER, ATTENDANCE, YEAR, SECTION, DEPARTMENT, FROM_DATE, TO_DATE, EXCEL_NAME, ACADEMIC_YEAR)
           VALUES (:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11)`,
                    [rollNo, name, phone, attendance, excelYear, section, department, fromDate, toDate, req.file.originalname, academicYear],
                    { autoCommit: true }
                );
            } catch (err) {
                console.error("❌ Upload save failed:", err);
                skippedRecords.push({ name, phone, reason: err.message });
                continue;
            }

            const formattedPhone = formatPhoneNumber(phone);
            if (!formattedPhone) {
                skippedRecords.push({ name, phone, reason: "Invalid phone number" });
                continue;
            }

            const message = `
Narayana Engineering College, Gudur

Your ward ${name} (Roll No: ${rollNo || "N/A"}) of ${excelYear} Year, ${department} - ${section || "N/A"} has ${attendance}% attendance from ${fromDate} to ${toDate}.
For more info contact HOD or Principal: +91 81219 79628`.trim();

            const result = await connection.execute(
                `INSERT INTO SMS (ROLL_NO, NAME, PHONE_NUMBER, MESSAGE, ATTENDANCE, YEAR, SECTION, DEPARTMENT, FROM_DATE, TO_DATE, ACADEMIC_YEAR, STATUS)
         VALUES (:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,'pending') RETURNING ID INTO :id`,
                {
                    1: rollNo,
                    2: name,
                    3: formattedPhone,
                    4: message,
                    5: attendance,
                    6: excelYear,
                    7: section,
                    8: department,
                    9: fromDate,
                    10: toDate,
                    11: academicYear,
                    id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                },
                { autoCommit: true }
            );

            const smsId = result.outBinds.id[0];
            const ackLink = `${process.env.FRONTEND_URL}/ack/${smsId}`;

            await connection.execute(
                `UPDATE SMS SET ACK_LINK = :ackLink WHERE ID = :id`,
                { ackLink, id: smsId },
                { autoCommit: true }
            );

            try {
                const twilioMsg = await client.messages.create({
                    body: `${message}\n\nPlease acknowledge: ${ackLink}`,
                    to: formattedPhone,
                    from: twilioPhone,
                });

                await connection.execute(
                    `UPDATE SMS SET SID = :sid, STATUS = :status, SMS_SENT = 1 WHERE ID = :id`,
                    { sid: twilioMsg.sid, status: twilioMsg.status, id: smsId },
                    { autoCommit: true }
                );

                console.log(`📤 SMS sent successfully to ${formattedPhone}, SID: ${twilioMsg.sid}`);
                sentRecords.push({ name, phone: formattedPhone });

            } catch (twilioErr) {
                console.error("❌ Twilio send failed:", twilioErr);
                await connection.execute(
                    `UPDATE SMS SET STATUS = 'failed', ERROR_MESSAGE = :err WHERE ID = :id`,
                    { err: twilioErr.message, id: smsId },
                    { autoCommit: true }
                );
                skippedRecords.push({ name, phone: formattedPhone, reason: twilioErr.message });
            }
        }

        res.json({
            success: true,
            sent: sentRecords.length,
            skipped: skippedRecords.length,
            skippedRecords,
        });

    } catch (err) {
        console.error("❌ sendBulkSms API error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
};

export const getSmsResults = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const userRole = req.user.role;
        let query = "SELECT * FROM SMS";
        let params = {};

        if (userRole.startsWith("hod")) {
            const dept = userRole.replace("hod-", "").toUpperCase();
            query += " WHERE DEPARTMENT = :dept";
            params.dept = dept;
        }

        const result = await connection.execute(query, params, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) {
        console.error("❌ getSmsResults error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
};

export const acknowledgeSms = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const smsId = req.params.smsId;
        const result = await connection.execute(
            `UPDATE SMS SET SEEN = 1 WHERE ID = :id`,
            { id: smsId },
            { autoCommit: true }
        );

        if (result.rowsAffected === 0)
            return res.status(404).json({ success: false, message: "Record not found." });

        res.json({ success: true, message: "Acknowledgment recorded!" });
    } catch (err) {
        console.error("❌ acknowledgeSms error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
};

export const getSmsById = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const smsId = req.params.smsId;
        const result = await connection.execute(
            `SELECT * FROM SMS WHERE ID = :id`,
            { id: smsId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0)
            return res.status(404).json({ success: false, message: "SMS not found." });

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("❌ getSmsById error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
};
