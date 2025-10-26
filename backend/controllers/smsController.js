import oracledb from "oracledb";
import twilio from "twilio";
import xlsx from "xlsx";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

oracledb.fetchAsString = [oracledb.CLOB];

async function getConnection() {
    return await oracledb.getConnection({
        user: process.env.ORACLE_USER,
        password: process.env.ORACLE_PASSWORD,
        connectionString: process.env.ORACLE_CONNECT_STRING,
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

// ===================================================================
// 🆕 GET STANDARD TEMPLATES
// ===================================================================
export const getStandardTemplates = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        // Standard templates
        const standard = await connection.execute(
            `SELECT ID, TEMPLATE_NAME, TEMPLATE_TEXT, 'TEMPLATES' AS SOURCE FROM TEMPLATES`,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json([...standard.rows]);
    } catch (err) {
        console.error("❌ Error fetching templates:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ===================================================================
// 🆕 GET ALL TEMPLATES
// ===================================================================
export const getAllTemplates = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        // Standard templates
        const standard = await connection.execute(
            `SELECT ID, TEMPLATE_NAME, TEMPLATE_TEXT, 'TEMPLATES' AS SOURCE FROM TEMPLATES`,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Edited templates
        const edited = await connection.execute(
            `SELECT ID, TEMPLATE_NAME, TEMPLATE_TEXT, 'EDITED_TEMPLATES' AS SOURCE FROM EDITED_TEMPLATES`,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json([...standard.rows, ...edited.rows]);
    } catch (err) {
        console.error("❌ Error fetching templates:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ===================================================================
// 📨 SEND BULK SMS
// ===================================================================
export const sendBulkSms = async (req, res) => {
    console.log("🚀 Entered sendBulkSms API");
    let connection;

    try {
        const { fromDate, toDate, attendanceFilter, department, academicYear, section, year, templateId } = req.body;

        if (!req.file) return res.status(400).json({ error: "Excel file required" });
        if (!templateId) return res.status(400).json({ error: "Message template required" });

        connection = await getConnection();

        console.log(templateId);

        // 🧩 Step 1: Try fetching from EDITED_TEMPLATES first
        const editedRes = await connection.execute(
            `SELECT TEMPLATE_TEXT FROM EDITED_TEMPLATES WHERE ORIGINAL_TEMPLATE_ID = :tid`,
            { tid: Number(templateId) },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        let templateText;

        if (editedRes.rows.length > 0) {
            console.log("✅ Using edited template");
            templateText = editedRes.rows[0].TEMPLATE_TEXT;
        } else {
            console.log("⚠️ Using default template");
            const defaultRes = await connection.execute(
                `SELECT TEMPLATE_TEXT FROM TEMPLATES WHERE ID = :tid`,
                { tid: Number(templateId) },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            if (defaultRes.rows.length === 0)
                return res.status(400).json({ error: "Invalid message template selected" });
            templateText = defaultRes.rows[0].TEMPLATE_TEXT;
        }

        console.log("📝 Final template text:", templateText);

        // Fetch selected template
        /*
        const templateRes = await connection.execute(
            `SELECT TEMPLATE_TEXT FROM TEMPLATES WHERE ID = :tid`,
            { tid: Number(templateId) },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log(templateRes);
        if (templateRes.rows.length === 0)
            return res.status(400).json({ error: "Invalid message template selected" });
*/

        const workbook = xlsx.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const sheetData = xlsx.utils.sheet_to_json(sheet);

        console.log(`📊 Total rows in Excel: ${sheetData.length}`);

        let sentRecords = [];
        let skippedRecords = [];
        let threshold = attendanceFilter === "<50" ? 50 : attendanceFilter === "<65" ? 65 : attendanceFilter === "<75" ? 75 : null;

        // INSERT INTO UPLOADS TABLE
        const uploadResult = await connection.execute(
            `INSERT INTO UPLOADS (
                EXCEL_NAME, DEPARTMENT, YEAR, SECTION, ACADEMIC_YEAR,
                FROM_DATE, TO_DATE, UPLOADED_BY
            ) VALUES (
                :excel_name, :dept, :year, :section, :acad_year,
                TO_DATE(:from_date, 'YYYY-MM-DD'), TO_DATE(:to_date, 'YYYY-MM-DD'), :uploaded_by
            ) RETURNING UPLOAD_ID INTO :upload_id`,
            {
                excel_name: req.file.originalname,
                dept: department,
                year,
                section,
                acad_year: academicYear,
                from_date: fromDate,
                to_date: toDate,
                uploaded_by: req.user?.username || "system",
                upload_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            },
            { autoCommit: true }
        );
        const uploadId = uploadResult.outBinds.upload_id[0];
        console.log(`📁 Created UPLOAD record with ID: ${uploadId}`);

        // PROCESS EACH STUDENT ROW
        for (let row of sheetData) {
            const rollNo = row["Roll No"] || row["Roll Number"] || "";
            const name = row["Name"] || "";
            const phone = row["Parent Mobile Number"] || row["Phone"] || "";
            const attendance = Number(row["Attendance"] || 0);
            const formattedPhone = formatPhoneNumber(phone);

            if (threshold !== null && attendance >= threshold) {
                skippedRecords.push({ name, phone, reason: `Attendance >= ${threshold}%` });
                continue;
            }
            if (!formattedPhone) {
                skippedRecords.push({ name, phone, reason: "Invalid phone number" });
                continue;
            }

            // INSERT OR GET STUDENT
            const studentRes = await connection.execute(
                `SELECT ID FROM STUDENTS WHERE ROLL_NO = :roll_no`,
                { roll_no: rollNo },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            let studentId;
            if (studentRes.rows.length > 0) {
                studentId = studentRes.rows[0].ID;
            } else {
                const insertStudent = await connection.execute(
                    `INSERT INTO STUDENTS (
                        ROLL_NO, NAME, PHONE_NUMBER, DEPARTMENT, YEAR, SECTION, ACADEMIC_YEAR
                     ) VALUES (
                        :roll_no, :name, :phone_number, :dept, :year, :section, :acad_year
                     ) RETURNING ID INTO :student_id`,
                    {
                        roll_no: rollNo,
                        name,
                        phone_number: formattedPhone,
                        dept: department,
                        year,
                        section,
                        acad_year: academicYear,
                        student_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                    },
                    { autoCommit: true }
                );
                studentId = insertStudent.outBinds.student_id[0];
            }

            // REPLACE PLACEHOLDERS IN TEMPLATE
            const message = templateText
                .replace(/\$\{name\}/g, name)
                .replace(/\$\{rollNo\}/g, rollNo)
                .replace(/\$\{year\}/g, year)
                .replace(/\$\{department\}/g, department)
                .replace(/\$\{section\}/g, section)
                .replace(/\$\{attendance\}/g, attendance)
                .replace(/\$\{fromDate\}/g, fromDate)
                .replace(/\$\{toDate\}/g, toDate)
                .trim();

            // INSERT INTO SMS TABLE
            const smsRes = await connection.execute(
                `INSERT INTO SMS (STUDENT_ID, UPLOAD_ID, MESSAGE, ATTENDANCE, STATUS)
                 VALUES (:student_id, :upload_id, :msg, :att, 'pending')
                 RETURNING ID INTO :sms_id`,
                {
                    student_id: studentId,
                    upload_id: uploadId,
                    msg: message,
                    att: attendance,
                    sms_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                },
                { autoCommit: true }
            );
            const smsId = smsRes.outBinds.sms_id[0];

            const ackLink = `${process.env.FRONTEND_URL}/ack/${smsId}`;
            await connection.execute(
                `INSERT INTO ACKNOWLEDGEMENT (SMS_ID, STUDENT_ID, ACK_LINK)
                 VALUES (:sms_id, :student_id, :ack_link)`,
                { sms_id: smsId, student_id: studentId, ack_link: ackLink },
                { autoCommit: true }
            );

            // SEND SMS
            try {
                await client.messages.create({
                    body: `${message}\n\nPlease acknowledge: ${ackLink}`,
                    to: formattedPhone,
                    from: twilioPhone,
                });

                await connection.execute(
                    `UPDATE SMS SET STATUS='sent', SMS_SENT=1 WHERE ID=:sms_id`,
                    { sms_id: smsId },
                    { autoCommit: true }
                );

                sentRecords.push({ name, phone: formattedPhone });
            } catch (twilioErr) {
                console.error("❌ Twilio failed:", twilioErr);
                await connection.execute(
                    `UPDATE SMS SET STATUS='failed', ERROR_MESSAGE=:err WHERE ID=:sms_id`,
                    { err: twilioErr.message, sms_id: smsId },
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

// ===================================================================
// 📋 GET ALL SMS RESULTS
// ===================================================================
export const getSmsResults = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const query = `
            SELECT S.ID, ST.ROLL_NO, ST.NAME, ST.PHONE_NUMBER, U.EXCEL_NAME, 
                   S.ATTENDANCE, S.STATUS, A.ACK_STATUS, A.ACK_TIME
            FROM SMS S
            JOIN STUDENTS ST ON S.STUDENT_ID = ST.ID
            JOIN UPLOADS U ON S.UPLOAD_ID = U.UPLOAD_ID
            LEFT JOIN ACKNOWLEDGEMENT A ON S.ID = A.SMS_ID
            ORDER BY S.CREATED_AT DESC
        `;
        const result = await connection.execute(query, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ===================================================================
// ✅ ACKNOWLEDGE SMS
// ===================================================================
export const acknowledgeSms = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const smsId = req.params.smsId;
        const result = await connection.execute(
            `UPDATE ACKNOWLEDGEMENT 
             SET ACK_STATUS='acknowledged', ACK_TIME=CURRENT_TIMESTAMP 
             WHERE SMS_ID=:sms_id`,
            { sms_id: smsId },
            { autoCommit: true }
        );

        if (result.rowsAffected === 0)
            return res.status(404).json({ success: false, message: "Record not found." });

        res.json({ success: true, message: "Acknowledgment recorded!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ===================================================================
// ✅ FETCH SINGLE SMS BY ID
// ===================================================================
export const getSmsById = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        const result = await connection.execute(
            `SELECT * FROM SMS WHERE ID = :sms_id`,
            { sms_id: id },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "SMS not found" });
        }

        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error("Error fetching SMS by ID:", error);
        res.status(500).json({ success: false, message: "Server error" });
    } finally {
        if (connection) await connection.close();
    }
};

// Save edited template
export const saveEditedTemplate = async (req, res) => {
    let connection;
    try {
        const { originalTemplateId, templateName, templateText, username } = req.body;
        console.log("🚀 saveEditedTemplate called with:", req.body);
        if (!originalTemplateId || !templateName || !templateText) {
            return res.status(400).json({ error: "All fields are required" });
        }

        connection = await getConnection();

        const result = await connection.execute(
            `INSERT INTO EDITED_TEMPLATES (ORIGINAL_TEMPLATE_ID, TEMPLATE_NAME, TEMPLATE_TEXT, CREATED_BY)
             VALUES (:original_id, :name, :text, :created_by)
             RETURNING ID INTO :new_id`,
            {
                original_id: Number(originalTemplateId),
                name: templateName,
                text: templateText,
                created_by: username || "system",
                new_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            },
            { autoCommit: true }
        );

        const newTemplateId = result.outBinds.new_id[0];
        res.json({ success: true, newTemplateId });
    } catch (err) {
        console.error("❌ saveEditedTemplate error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
};
