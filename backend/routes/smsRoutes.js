import express from "express";
import multer from "multer";
import { sendBulkSms, getSmsResults, acknowledgeSms } from "../controllers/smsController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/send-bulk-sms", upload.single("file"), sendBulkSms);
router.get("/results", getSmsResults);
router.get("/ack/:smsId", acknowledgeSms);

export default router;
/*
import express from "express";
import multer from "multer";
import { sendBulkSms, getSmsResults, acknowledgeSms } from "../controllers/smsController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/send-bulk-sms", upload.single("file"), (req, res, next) => {
    console.log("🚀 Route /send-bulk-sms hit");
    next();
}, sendBulkSms);

router.get("/results", (req, res, next) => {
    console.log("🚀 Route /results hit");
    next();
}, getSmsResults);

router.get("/ack/:smsId", (req, res, next) => {
    console.log(`🚀 Route /ack/${req.params.phoneNumber} hit`);
    next();
}, acknowledgeSms);


export default router;
*/