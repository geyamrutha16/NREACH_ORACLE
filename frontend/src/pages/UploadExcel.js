import React, { useState } from "react";
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
                            background: "#2563eb", // darker blue
                            color: "#fff",
                            fontWeight: "600",
                            fontSize: "1rem",
                        }}
                    >
                        {loading ? "⏳ Sending..." : "🚀 Send SMS"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UploadExcel;
