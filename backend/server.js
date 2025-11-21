import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import smsRoutes from "./routes/smsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { checkTwilioAccountStatus } from "./config/twillio.js";
import { seedUsers } from "./controllers/authController.js";

dotenv.config();
await connectDB();
checkTwilioAccountStatus();
seedUsers();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/sms", smsRoutes);
app.use("/api/student", studentRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
