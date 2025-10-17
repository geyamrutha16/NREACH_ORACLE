// controllers/authController.js
import oracledb from 'oracledb';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const dbConfig = {
    user: "NECG",           // Use the schema that owns USERS table
    password: "password",
    connectString: "localhost:1521/FREEPDB1"
};

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

        const isMatch = crypto.createHash('sha256').update(password).digest('hex');

        // Compare the password hash
        if (!isMatch) {
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

export const logoutUser = async (req, res) => {
    res.json({ success: true, message: "Logout successful" });
};