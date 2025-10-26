import express from "express";
import { loginUser, logoutUser, sendOtp, verifyOtp } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/send-otp", sendOtp);      // Student OTP send
router.post("/verify-otp", verifyOtp);
router.post("/logout", logoutUser);

export default router;