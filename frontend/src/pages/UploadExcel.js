import React, { useState } from "react";
import axios from "axios";

const UploadExcel = ({ setRefresh }) => {
    const [file, setFile] = useState(null);
    const [year, setYear] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: "", type: "" });

    const showNotification = (message, type = "info") => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !year || !fromDate || !toDate) {
            showNotification("⚠️ Please upload file, select year, and provide from/to dates.", "warning");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("year", year);
        formData.append("fromDate", fromDate);
        formData.append("toDate", toDate);

        try {
            setLoading(true);
            showNotification("⏳ Sending bulk SMS...", "info");

            const res = await axios.post(
                "https://multiple-sms-backend.onrender.com/api/sms/send-bulk-sms",
                formData
            );

            console.log("[DEBUG] Bulk SMS response:", res.data);

            showNotification("✅ Bulk SMS sent successfully!", "success");
            setRefresh((prev) => !prev);

            // Reset inputs
            setFile(null);
            setYear("");
            setFromDate("");
            setToDate("");
            e.target.reset();

        } catch (err) {
            console.error("[DEBUG] Error sending bulk SMS:", err);
            showNotification("❌ Failed to send SMS. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const getNotificationStyle = () => {
        const baseStyle = {
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "12px 20px",
            borderRadius: "8px",
            color: "white",
            fontWeight: "600",
            zIndex: 1000,
            transition: "all 0.3s ease",
        };

        switch (notification.type) {
            case "success":
                return { ...baseStyle, background: "#10b981" };
            case "error":
                return { ...baseStyle, background: "#ef4444" };
            case "warning":
                return { ...baseStyle, background: "#f59e0b" };
            default:
                return { ...baseStyle, background: "#3b82f6" };
        }
    };

    return (
        <>
            {notification.show && (
                <div style={getNotificationStyle()}>
                    {notification.message}
                </div>
            )}

            <div
                style={{
                    background: "#f9fafb",
                    color: "#000",
                    padding: "30px",
                    borderRadius: "12px",
                    maxWidth: "600px",
                    margin: "30px auto",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
            >
                {/* ... rest of your component remains the same ... */}
            </div>
        </>
    );
};

export default UploadExcel;