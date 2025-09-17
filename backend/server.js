import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { connectDB } from "./config/db.js";
import smsRoutes from "./routes/smsRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { checkTwilioAccountStatus } from "./config/twillio.js";

dotenv.config();
connectDB();
checkTwilioAccountStatus();

const app = express();
app.use(cors({
    origin: "https://multiple-sms-frontend.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

app.use("/api/sms", smsRoutes);

console.log("🔑 Account SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("🔑 Auth Token:", process.env.TWILIO_AUTH_TOKEN);
console.log("🔑 Twilio Phone:", process.env.TWILIO_PHONE_NUMBER);

console.log("📡 Middleware setup complete");

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));