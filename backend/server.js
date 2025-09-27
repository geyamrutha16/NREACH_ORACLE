import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import smsRoutes from "./routes/smsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { checkTwilioAccountStatus } from "./config/twillio.js";

dotenv.config();
connectDB();
checkTwilioAccountStatus();


const app = express();
const allowedOrigins = [
    "http://localhost:3000",
    "https://nreach-o855.onrender.com"
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin like Postman
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/sms", smsRoutes);

console.log("🔑 Account SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("🔑 Auth Token:", process.env.TWILIO_AUTH_TOKEN);
console.log("🔑 Twilio Phone:", process.env.TWILIO_PHONE_NUMBER);

console.log("📡 Middleware setup complete");

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
