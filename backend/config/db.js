// config/db.js
import oracledb from 'oracledb';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
    user: process.env.ORACLE_USER || "system",
    password: process.env.ORACLE_PASSWORD || "oracle",
    connectString: process.env.ORACLE_CONNECT_STRING || "localhost/XEPDB1",
};

let connection;

export const connectDB = async () => {
    try {
        connection = await oracledb.getConnection(dbConfig);
        console.log("✅ OracleDB Connected Successfully");

        // Test the connection
        const result = await connection.execute(`SELECT 'Connection successful' FROM DUAL`);
        console.log("🔍 Connection test:", result.rows[0][0]);

    } catch (err) {
        console.error("❌ Database connection failed:", err);
        process.exit(1);
    }
}

export { connection };
/*
import oracledb from "oracledb";
import dotenv from "dotenv";
dotenv.config();

export let connection;

export const connectDB = async () => {
    try {
        console.log("🔍 ENV:", process.env.ORACLE_CONNECT_STRING);
        connection = await oracledb.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONNECT_STRING,
        });

        console.log("✅ OracleDB Connected Successfully");
    } catch (err) {
        console.error("❌ OracleDB Connection Failed:", err);
        process.exit(1);
    }
};
*/
