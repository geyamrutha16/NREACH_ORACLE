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
        setTimeout(() => {
            setNotification({ show: false, message: "", type: "" });
        }, 4000);
    };

    const getValidationMessage = () => {
        const missingFields = [];

        if (!file) missingFields.push("Excel file");
        if (!year) missingFields.push("year");
        if (!fromDate) missingFields.push("from date");
        if (!toDate) missingFields.push("to date");

        if (missingFields.length === 0) return null;

        if (missingFields.length === 1) {
            const field = missingFields[0];
            const action = field === "Excel file" ? "upload" : "select";
            return `Please ${action} ${field}.`;
        }

        if (missingFields.length === 4) {
            return "Please upload file, select year, and provide from/to dates.";
        }

        const lastField = missingFields.pop();
        const fieldsList = missingFields.join(", ");
        const hasFile = missingFields.some(f => f === "Excel file");
        const action = hasFile ? "upload" : "select";

        return `Please ${action} ${fieldsList} and ${lastField}.`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationMessage = getValidationMessage();
        if (validationMessage) {
            showNotification(validationMessage, "warning");
            return; // Stop the function execution here
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
            padding: "16px 24px",
            borderRadius: "12px",
            color: "white",
            fontWeight: "600",
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            minWidth: "300px",
            maxWidth: "400px",
            animation: "slideIn 0.3s ease-out",
            transform: notification.show ? "translateX(0)" : "translateX(100%)",
            opacity: notification.show ? 1 : 0,
            transition: "all 0.3s ease",
        };

        const typeStyles = {
            success: { background: "linear-gradient(135deg, #10b981, #059669)", borderLeft: "4px solid #047857" },
            error: { background: "linear-gradient(135deg, #ef4444, #dc2626)", borderLeft: "4px solid #b91c1c" },
            warning: { background: "linear-gradient(135deg, #f59e0b, #d97706)", borderLeft: "4px solid #b45309" },
            info: { background: "linear-gradient(135deg, #3b82f6, #2563eb)", borderLeft: "4px solid #1d4ed8" }
        };

        return { ...baseStyle, ...typeStyles[notification.type] };
    };

    const getNotificationIcon = () => {
        switch (notification.type) {
            case "success": return "✅";
            case "error": return "❌";
            case "warning": return "⚠️";
            default: return "ℹ️";
        }
    };

    return (
        <>
            {notification.show && (
                <div style={getNotificationStyle()}>
                    <span style={{ fontSize: "18px" }}>{getNotificationIcon()}</span>
                    <span>{notification.message}</span>
                    <button
                        onClick={() => setNotification({ show: false, message: "", type: "" })}
                        style={{
                            background: "none",
                            border: "none",
                            color: "white",
                            fontSize: "18px",
                            cursor: "pointer",
                            marginLeft: "auto",
                            padding: "0",
                            minWidth: "auto"
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}

            <style>
                {`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                `}
            </style>

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
                <h2 style={{ marginBottom: "20px", fontWeight: "700" }}>📤 Send Bulk SMS</h2>

                <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
                    {/* Upload Excel */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                            Upload Excel File:
                        </label>
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => setFile(e.target.files[0])}
                            style={{
                                padding: "8px",
                                width: "100%",
                                borderRadius: "6px",
                                border: "1px solid #888",
                                color: "#000",
                            }}
                        />
                    </div>

                    {/* Year Dropdown */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                            Select Year:
                        </label>
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            style={{
                                padding: "8px",
                                width: "100%",
                                borderRadius: "6px",
                                border: "1px solid #888",
                                color: "#000",
                                background: "#fff",
                            }}
                        >
                            <option value="">-- Select Year --</option>
                            <option value="I">I</option>
                            <option value="II">II</option>
                            <option value="III">III</option>
                            <option value="IV">IV</option>
                        </select>
                    </div>

                    {/* From Date */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                            From Date:
                        </label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            style={{
                                padding: "8px",
                                width: "100%",
                                borderRadius: "6px",
                                border: "1px solid #888",
                                color: "#000",
                            }}
                        />
                    </div>

                    {/* To Date */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                            To Date:
                        </label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            style={{
                                padding: "8px",
                                width: "100%",
                                borderRadius: "6px",
                                border: "1px solid #888",
                                color: "#000",
                            }}
                        />
                    </div>

                    {/* Submit */}
                    <div style={{ textAlign: "center" }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: "12px 24px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: loading ? "not-allowed" : "pointer",
                                background: loading ? "#94a3b8" : "#2563eb",
                                color: "#fff",
                                fontWeight: "600",
                                fontSize: "1rem",
                                transition: "background 0.2s ease",
                            }}
                        >
                            {loading ? "⏳ Sending..." : "🚀 Send SMS"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default UploadExcel;

/*import React, { useState } from "react";
import axios from "axios";

const UploadExcel = ({ setRefresh }) => {
    const [file, setFile] = useState(null);
    const [year, setYear] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !year || !fromDate || !toDate) {
            alert("⚠️ Please upload file, select year, and provide from/to dates.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("year", year);
        formData.append("fromDate", fromDate);
        formData.append("toDate", toDate);

        try {
            setLoading(true);
            const res = await axios.post(
                "https://multiple-sms-backend.onrender.com/api/sms/send-bulk-sms",
                formData
            );
            console.log("[DEBUG] Bulk SMS response:", res.data);
            setRefresh((prev) => !prev);
            alert("✅ Bulk SMS sent successfully!");

            // Reset inputs
            setFile(null);
            setYear("");
            setFromDate("");
            setToDate("");
            e.target.reset();
        } catch (err) {
            console.error("[DEBUG] Error sending bulk SMS:", err);
            alert("❌ Failed to send SMS.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                background: "#f9fafb", // light gray instead of pure white
                color: "#000",         // black text everywhere
                padding: "30px",
                borderRadius: "12px",
                maxWidth: "600px",
                margin: "30px auto",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
        >
            <h2 style={{ marginBottom: "20px", fontWeight: "700" }}>📤 Send Bulk SMS</h2>

            <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
               
<div style={{ marginBottom: "20px" }}>
    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
        Upload Excel File:
    </label>
    <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files[0])}
        style={{
            padding: "8px",
            width: "100%",
            borderRadius: "6px",
            border: "1px solid #888",
            color: "#000",
        }}
    />
</div>

<div style={{ marginBottom: "20px" }}>
    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
        Select Year:
    </label>
    <select
        value={year}
        onChange={(e) => setYear(e.target.value)}
        style={{
            padding: "8px",
            width: "100%",
            borderRadius: "6px",
            border: "1px solid #888",
            color: "#000",
            background: "#fff",
        }}
    >
        <option value="">-- Select Year --</option>
        <option value="I">I</option>
        <option value="II">II</option>
        <option value="III">III</option>
        <option value="IV">IV</option>
    </select>
</div>


<div style={{ marginBottom: "20px" }}>
    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
        From Date:
    </label>
    <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        style={{
            padding: "8px",
            width: "100%",
            borderRadius: "6px",
            border: "1px solid #888",
            color: "#000",
        }}
    />
</div>

<div style={{ marginBottom: "20px" }}>
    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
        To Date:
    </label>
    <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        style={{
            padding: "8px",
            width: "100%",
            borderRadius: "6px",
            border: "1px solid #888",
            color: "#000",
        }}
    />
</div>

<div style={{ textAlign: "center" }}>
    <button
        type="submit"
        disabled={loading}
        style={{
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            background: "#2563eb", // darker blue
            color: "#fff",
            fontWeight: "600",
            fontSize: "1rem",
        }}
    >
        {loading ? "⏳ Sending..." : "🚀 Send SMS"}
    </button>
</div>
            </form >
        </div >
    );
};

export default UploadExcel;
*/