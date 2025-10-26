import express from "express";
import { fetchSmsByPhone } from "../controllers/studentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/data", authMiddleware, fetchSmsByPhone);

export default router;