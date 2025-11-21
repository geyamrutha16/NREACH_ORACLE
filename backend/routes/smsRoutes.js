import express from "express";
import multer from "multer";
import { sendBulkSms, getSmsResults, acknowledgeSms, getSmsById, saveEditedTemplate, getStandardTemplates } from "../controllers/smsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/send-bulk-sms", upload.single("file"), sendBulkSms);
router.post("/templates/save-edited", saveEditedTemplate);
router.get("/results", authMiddleware, getSmsResults);
router.get("/templates", getStandardTemplates);
router.put("/ack/:smsId", acknowledgeSms);
router.get("/record/:smsId", getSmsById);

export default router;
