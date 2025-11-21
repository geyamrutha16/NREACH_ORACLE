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

        if (!templateId) return res.status(400).json({ error: "Message template required" });

        connection = await getConnection();

        // 🧩 Step 1: Fetch the latest edited or default template
        const editedRes = await connection.execute(
            `SELECT TEMPLATE_TEXT 
             FROM EDITED_TEMPLATES 
             WHERE ORIGINAL_TEMPLATE_ID = :tid
             ORDER BY ID DESC
             FETCH FIRST 1 ROW ONLY`,
            { tid: Number(templateId) },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        let templateText = "";

        if (editedRes.rows.length > 0) {
            console.log("✅ Using latest edited template");
            templateText = editedRes.rows[0].TEMPLATE_TEXT;
        } else {
            console.log("⚠️ Using default template");
            const defaultRes = await connection.execute(
                `SELECT TEMPLATE_TEXT FROM TEMPLATES WHERE ID = :tid`,
                { tid: Number(templateId) },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            templateText = defaultRes.rows[0].TEMPLATE_TEXT;
        }

        console.log("📝 Final template text:", templateText);

        // 🧮 Determine attendance threshold
        const threshold =
            attendanceFilter === "<50"
                ? 50
                : attendanceFilter === "<65"
                    ? 65
                    : attendanceFilter === "<75"
                        ? 75
                        : null;

        // ===========================================================
        // CASE 1: Excel provided (old logic)
        // ===========================================================
        let studentsData = [];
        let excelName = null;

        if (req.file) {
            const workbook = xlsx.readFile(req.file.path);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const sheetData = xlsx.utils.sheet_to_json(sheet);
            console.log(`📊 Total rows in Excel: ${sheetData.length}`);
            studentsData = sheetData;
            excelName = req.file.originalname;
        } else {
            // ===========================================================
            // CASE 2: No Excel — Fetch from STUDENTS table
            // ===========================================================
            console.log("📂 No Excel uploaded — fetching students from STUDENTS table...");
            const dbRes = await connection.execute(
                `SELECT ROLL_NO, NAME, PHONE_NUMBER, YEAR, SECTION, DEPARTMENT, ACADEMIC_YEAR, ATTENDANCE
   FROM STUDENTS
   WHERE (:dept IS NULL OR UPPER(DEPARTMENT) = UPPER(:dept))
     AND (:year IS NULL OR UPPER(YEAR) = UPPER(:year))
     AND (:section IS NULL OR UPPER(SECTION) = UPPER(:section))`,
                { dept: department, year, section },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            studentsData = dbRes.rows;
            excelName = "DB_FETCH";
            console.log(`📊 Retrieved ${studentsData.length} students from database`);
        }

        // ===========================================================
        // CREATE UPLOAD RECORD
        // ===========================================================
        const uploadResult = await connection.execute(
            `INSERT INTO UPLOADS (
                EXCEL_NAME, DEPARTMENT, YEAR, SECTION, ACADEMIC_YEAR,
                FROM_DATE, TO_DATE, UPLOADED_BY
            ) VALUES (
                :excel_name, :dept, :year, :section, :acad_year,
                TO_DATE(:from_date, 'YYYY-MM-DD'), TO_DATE(:to_date, 'YYYY-MM-DD'), :uploaded_by
            ) RETURNING UPLOAD_ID INTO :upload_id`,
            {
                excel_name: excelName,
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

        // ===========================================================
        // PROCESS EACH STUDENT
        // ===========================================================
        const sentRecords = [];
        const skippedRecords = [];

        for (let row of studentsData) {
            const rollNo = row["Roll No"] || row["ROLL_NO"] || row.ROLL_NO || "N/A";
            const name = row["Name"] || row.NAME || "N/A";
            const phone = row["Parent Mobile Number"] || row["PHONE_NUMBER"] || row.PHONE_NUMBER || "N/A";
            const attendance = Number(row["Attendance"] ?? row.ATTENDANCE ?? 0);
            const studentYear = row["Year"] || row.YEAR || year;
            const studentSection = row["Section"] || row.SECTION || section;
            const formattedPhone = formatPhoneNumber(phone);

            if (threshold !== null && attendance >= threshold) {
                skippedRecords.push({ name, phone, reason: `Attendance >= ${threshold}%` });
                continue;
            }
            if (!formattedPhone) {
                skippedRecords.push({ name, phone, reason: "Invalid phone number" });
                continue;
            }

            // FIND OR CREATE STUDENT
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

            // REPLACE VARIABLES IN TEMPLATE
            const message = templateText
                .replace(/\$\{name\}/g, name)
                .replace(/\$\{rollNo\}/g, rollNo)
                .replace(/\$\{year\}/g, studentYear)
                .replace(/\$\{department\}/g, department)
                .replace(/\$\{section\}/g, studentSection)
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

            // SEND SMS VIA TWILIO
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
            source: req.file ? "excel" : "database",
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
// 📋 GET ALL SMS RESULTS (Oracle version with role-based filtering)
// ===================================================================
export const getSmsResults = async (req, res) => {
    let connection;

    try {
        console.log("🔍 Entered getSmsResults API (Oracle)");

        const userRole = req.user.role;
        console.log("📝 User role:", userRole);

        connection = await getConnection();

        // -----------------------------
        // BASE QUERY
        // -----------------------------
        let query = `
            SELECT 
                s.ID AS SMS_ID,
                s.STUDENT_ID AS STUDENT_ID,
                s.UPLOAD_ID AS UPLOAD_ID,
                s.MESSAGE AS SMS_MESSAGE,
                s.ATTENDANCE AS SMS_ATTENDANCE,
                s.STATUS AS SMS_STATUS,
                s.SMS_SENT AS SMS_SENT,
                s.SEEN AS SMS_SEEN,
                
                st.NAME AS STUDENT_NAME,
                st.ROLL_NO AS STUDENT_ROLL,
                st.PHONE_NUMBER AS STUDENT_PHONE,
                st.YEAR AS STUDENT_YEAR,
                st.SECTION AS STUDENT_SECTION,
                st.DEPARTMENT AS STUDENT_DEPARTMENT,
                st.ACADEMIC_YEAR AS STUDENT_ACADEMIC_YEAR,
                st.ATTENDANCE AS STUDENT_ATTENDANCE,

                s.CREATED_AT AS SMS_CREATED_AT,

                a.ACK_STATUS AS ACK_STATUS,
                a.ACK_TIME AS ACK_TIME
            FROM SMS s
            JOIN STUDENTS st ON s.STUDENT_ID = st.ID
            LEFT JOIN ACKNOWLEDGEMENT a ON s.ID = a.SMS_ID
        `;

        // -----------------------------
        // ROLE-BASED FILTER
        // -----------------------------
        const binds = {};

        if (userRole && userRole.toLowerCase().startsWith("hod-")) {
            const dept = userRole.replace("hod-", "").toUpperCase();
            query += ` WHERE UPPER(st.DEPARTMENT) = :dept`;
            binds.dept = dept;

            console.log("📂 HOD Filter applied → Department:", dept);
        } else {
            console.log("📂 No department filter (Admin/Operator)");
        }

        // -----------------------------
        // ORDER BY
        // -----------------------------
        query += ` ORDER BY s.CREATED_AT DESC`;

        // -----------------------------
        // EXECUTE QUERY (FIXED)
        // -----------------------------
        const result = await connection.execute(query, binds, {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
        });

        // -----------------------------
        // CLEAN RESPONSE MAPPING
        // -----------------------------
        const sms = result.rows.map((row) => ({
            id: row.SMS_ID,
            studentId: row.STUDENT_ID,
            uploadId: row.UPLOAD_ID,
            message: row.SMS_MESSAGE,
            attendance: row.SMS_ATTENDANCE ?? row.STUDENT_ATTENDANCE ?? 0,
            status: row.SMS_STATUS,
            smsSent: row.SMS_SENT,
            seen: row.SMS_SEEN,

            name: row.STUDENT_NAME,
            rollNo: row.STUDENT_ROLL,
            phoneNumber: row.STUDENT_PHONE,
            year: row.STUDENT_YEAR,
            section: row.STUDENT_SECTION,
            department: row.STUDENT_DEPARTMENT,
            academicYear: row.STUDENT_ACADEMIC_YEAR,

            createdAt: row.SMS_CREATED_AT,

            ackStatus: row.ACK_STATUS,
            ackTime: row.ACK_TIME,
        }));

        console.log("✅ Records fetched:", sms.length);

        res.json(sms);

    } catch (err) {
        console.error("❌ Error in getSmsResults:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

// ===================================================================
// ✅ ACKNOWLEDGE SMS (Fixed)
// ===================================================================

export const acknowledgeSms = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const smsId = req.params.smsId;

        console.log("🚀 Acknowledge SMS called with params:", req.params);

        // 1️⃣ Get student ID from SMS
        const studentRes = await connection.execute(
            `SELECT STUDENT_ID FROM SMS WHERE ID = :sms_id`,
            { sms_id: smsId }
        );

        if (studentRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "SMS record not found." });
        }

        const studentId = studentRes.rows[0][0];

        // 2️⃣ MERGE to update existing or insert new acknowledgment
        const result = await connection.execute(
            `MERGE INTO ACKNOWLEDGEMENT a
       USING (SELECT :sms_id AS sms_id, :student_id AS student_id FROM dual) b
       ON (a.SMS_ID = b.sms_id)
       WHEN MATCHED THEN
         UPDATE SET ACK_STATUS='acknowledged', ACK_TIME=CURRENT_TIMESTAMP
       WHEN NOT MATCHED THEN
         INSERT (SMS_ID, STUDENT_ID, ACK_STATUS, ACK_TIME)
         VALUES (b.sms_id, b.student_id, 'acknowledged', CURRENT_TIMESTAMP)`,
            { sms_id: smsId, student_id: studentId },
            { autoCommit: true }
        );

        await connection.execute(
            `UPDATE SMS SET SEEN = 1 WHERE ID = :sms_id`,
            { sms_id: smsId },
            { autoCommit: true }
        );

        console.log("✅ Student ID for SMS:", studentId);
        console.log("✅ MERGE result:", result);
        console.log("📝 Acknowledgment MERGE executed");

        res.json({ success: true, message: "Acknowledgment recorded!" });
    } catch (err) {
        console.error("❌ Error acknowledging SMS:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ===================================================================
// ✅ FETCH SINGLE SMS BY ID
// ===================================================================
export const getSmsById = async (req, res) => {
    // GET /api/sms/record/:smsId
    let connection;
    try {
        connection = await getConnection();
        const { smsId } = req.params;

        const result = await connection.execute(
            `SELECT s.ID, s.STUDENT_ID, s.UPLOAD_ID, s.MESSAGE, s.ATTENDANCE, s.STATUS, s.SMS_SENT, s.SEEN,
            s.CREATED_AT, a.ACK_STATUS, a.ACK_TIME, st.NAME, st.ROLL_NO, st.PHONE_NUMBER, st.YEAR, st.SECTION,
            st.ATTENDANCE AS STUDENT_ATTENDANCE,
            u.FROM_DATE, u.TO_DATE
     FROM SMS s
     JOIN STUDENTS st ON s.STUDENT_ID = st.ID
     LEFT JOIN ACKNOWLEDGEMENT a ON s.ID = a.SMS_ID
     LEFT JOIN UPLOADS u ON s.UPLOAD_ID = u.UPLOAD_ID
     WHERE s.ID = :smsId`,
            { smsId: Number(smsId) },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0)
            return res.status(404).json({ success: false, message: "Record not found." });

        const row = result.rows[0];
        const data = {
            id: row.ID,
            studentId: row.STUDENT_ID,
            uploadId: row.UPLOAD_ID,
            message: row.MESSAGE || "N/A",
            attendance: row.SMS_ATTENDANCE ?? row.STUDENT_ATTENDANCE ?? 0,
            status: row.STATUS || "pending",
            smsSent: row.SMS_SENT ?? 0,
            seen: row.SEEN ?? false,
            ackStatus: row.ACK_STATUS || "not_acknowledged",
            ackTime: row.ACK_TIME || null,
            name: row.NAME || "N/A",
            rollNo: row.ROLL_NO || "N/A",
            phoneNumber: row.PHONE_NUMBER || "N/A",
            year: row.YEAR || "N/A",
            section: row.SECTION || "N/A",
            createdAt: row.CREATED_AT || new Date().toISOString(),
            fromDate: row.FROM_DATE || "N/A",
            toDate: row.TO_DATE || "N/A",
        };

        res.json({ success: true, data });

    } catch (err) {
        console.error("❌ Error fetching SMS record:", err);
        res.status(500).json({ success: false, error: err.message });
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
