// controllers/authController.js
import oracledb from 'oracledb';
import jwt from "jsonwebtoken";
import crypto from "crypto";
import twilio from "twilio";
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
    user: process.env.ORACLE_USER || "system",
    password: process.env.ORACLE_PASSWORD || "oracle",
    connectString: process.env.ORACLE_CONNECT_STRING || "localhost/XEPDB1",
};

export const seedUsers = async (req, res) => {
    const users = [
        { username: "operator", password: "operator123", role: "operator" },
        { username: "hod-cse", password: "hod-cse123", role: "hod-cse" },
        { username: "hod-ece", password: "hod-ece123", role: "hod-ece" },
        { username: "hod-eee", password: "hod-eee123", role: "hod-eee" },
        { username: "hod-civil", password: "hod-civil123", role: "hod-civil" },
        { username: "hod-mech", password: "hod-mech123", role: "hod-mech" },

    ];

    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        for (const u of users) {
            const hash = crypto.createHash('sha256').update(u.password).digest('hex');
            await conn.execute(
                `INSERT INTO USERS (USERNAME, PASSWORD, ROLE) VALUES (:username, :password, :role)`,
                [u.username, hash, u.role]
            );
        }
        await conn.commit();
        console.log("✅ Seeded USERS table successfully");
    } catch (err) {
        console.error("❌ Error seeding:", err);
    } finally {
        if (conn) await conn.close();
    }
}

export const loginUser = async (req, res) => {
    let connection;
    try {
        const { username, password } = req.body;
        console.log("🔍 Login attempt:", username);
        console.log("🔍 Login attempt:", password);

        // Connect to OracleDB as NECG
        connection = await oracledb.getConnection(dbConfig);
        console.log("✅ Database connection created");

        // Check if USERS table has the username
        const sql = `SELECT ID, USERNAME, PASSWORD, ROLE 
                     FROM USERS 
                     WHERE USERNAME = :username`;
        const result = await connection.execute(sql, [username], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        console.log("🔍 Query result:", result.rows);

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        const user = result.rows[0];

        const hash = crypto.createHash('sha256').update(password).digest('hex');
        if (hash !== user.PASSWORD) {
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.ID, username: user.USERNAME, role: user.ROLE },
            process.env.JWT_SECRET || "secret_key",
            { expiresIn: "1h" }
        );

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: { id: user.ID, username: user.USERNAME, role: user.ROLE }
        });

    } catch (err) {
        console.error("❌ loginUser error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
};

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Temporary OTP store
const otpStore = {}; // { "+91xxxxxxxxxx": otp }

function formatPhoneNumber(num) {
    if (!num) return null;
    let phone = String(num).trim().replace(/\D/g, "");
    if (phone.startsWith("0")) phone = phone.substring(1);
    if (!phone.startsWith("91")) phone = "91" + phone;
    return "+" + phone;
}

// --- Send OTP ---
export const sendOtp = async (req, res) => {
    let { mobile } = req.body;
    if (!mobile) return res.status(400).json({ success: false, message: "Mobile required" });

    mobile = formatPhoneNumber(mobile);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[mobile] = otp;

    console.log(`OTP for ${mobile}: ${otp}`);

    try {
        await client.messages.create({
            body: `Your NReach OTP is: ${otp}`,
            from: twilioPhone,
            to: mobile
        });

        res.json({ success: true, message: "OTP sent successfully" });
    } catch (err) {
        console.error("Twilio sendOtp error:", err);
        res.status(500).json({ success: false, message: "Failed to send OTP" });
    }
};

// --- Verify OTP ---
export const verifyOtp = async (req, res) => {
    let { mobile, otp } = req.body;
    if (!mobile || !otp) return res.status(400).json({ success: false, message: "Mobile and OTP required" });

    mobile = formatPhoneNumber(mobile);

    if (otpStore[mobile] !== otp) {
        return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    // ✅ Optional: fetch student from DB
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const sql = `SELECT ID, NAME FROM STUDENTS WHERE PHONE_NUMBER = :mobile`;
        const result = await connection.execute(sql, [mobile], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        const student = result.rows[0];

        const token = jwt.sign(
            { id: student.ID, mobile, role: "student" },
            process.env.JWT_SECRET || "secret_key",
            { expiresIn: "1h" }
        );

        delete otpStore[mobile]; // remove OTP after verification

        res.json({ success: true, token, user: { id: student.ID, mobile, role: "student" } });
    } catch (err) {
        console.error("verifyOtp error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    } finally {
        if (connection) await connection.close();
    }
};

// --- Logout User ---
export const logoutUser = async (req, res) => {
    res.json({ success: true, message: "Logout successful" });
};