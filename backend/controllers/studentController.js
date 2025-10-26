import oracledb from 'oracledb';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
    user: process.env.ORACLE_USER || "system",
    password: process.env.ORACLE_PASSWORD || "oracle",
    connectString: process.env.ORACLE_CONNECT_STRING || "localhost/XEPDB1",
};

export const fetchSmsByPhone = async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number required" });
    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
    console.log("Fetching SMS for phone:", formattedPhone);

    try {
        const connection = await oracledb.getConnection(dbConfig);

        // Ensure rows come back as objects
        oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

        const smsQuery = `
            SELECT s.id AS sms_id, st.roll_no, st.name, st.phone_number, st.department, 
                   st.year, st.section, s.message, s.attendance, s.status, s.sms_sent,
                   s.seen, s.error_message, s.created_at, u.department AS uploaded_department
            FROM sms s
            JOIN students st ON s.student_id = st.id
            JOIN uploads u ON s.upload_id = u.upload_id
            WHERE st.phone_number = :formattedPhone
            ORDER BY s.created_at DESC
        `;

        const result = await connection.execute(smsQuery, { formattedPhone });
        console.log("Result: ", result.rows);
        res.json({ attendance: result.rows }); // now rows are objects

        await connection.close();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
