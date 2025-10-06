import React, { useState, useEffect } from "react";
import axios from "axios";

const UploadExcel = ({ setRefresh, user }) => {
    const [file, setFile] = useState(null);
    const [year, setYear] = useState("");
    const [section, setSection] = useState("");
    const [rollNo, setRollNo] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [department, setDepartment] = useState("");
    const [attendanceFilter, setAttendanceFilter] = useState("");
    const [academicYear, setAcademicYear] = useState("");
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: "", type: "" });
    const [academicYearsList, setAcademicYearsList] = useState([]);

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let y = 2022; y <= currentYear; y++) {
            years.push(y);
        }
        setAcademicYearsList(years);
    }, []);

    const showNotification = (message, type = "info") => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 4000);
    };

    const getValidationMessage = () => {
        const missingFields = [];
        if (!file) missingFields.push("Excel file");
        if (!fromDate) missingFields.push("From Date");
        if (!toDate) missingFields.push("To Date");
        if (!department && user?.role !== "hod") missingFields.push("Department");
        if (!attendanceFilter) missingFields.push("Attendance Filter");
        if (!academicYear) missingFields.push("Academic Year");

        if (missingFields.length === 0) return null;
        if (missingFields.length === 1) return `Please select/upload ${missingFields[0]}.`;

        const last = missingFields.pop();
        return `Please select/upload ${missingFields.join(", ")} and ${last}.`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationMessage = getValidationMessage();
        if (validationMessage) {
            showNotification(validationMessage, "warning");
            return;
        }

        if (new Date(toDate) == new Date(fromDate)) {
            showNotification("End date cannot be same as start date.", "error");
            return;
        }

        if (new Date(toDate) < new Date(fromDate)) {
            showNotification("End date cannot be earlier than start date.", "error");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("year", year);
        formData.append("section", section);
        formData.append("rollNo", rollNo);
        formData.append("fromDate", fromDate);
        formData.append("toDate", toDate);
        formData.append("attendanceFilter", attendanceFilter);
        formData.append("academicYear", academicYear);

        if (user?.role === "hod" && user.department) {
            formData.append("department", user.department);
        } else {
            formData.append("department", department);
        }

        try {
            setLoading(true);
            showNotification("Processing Excel file and sending SMS...", "info");

            const res = await axios.post(
                "https://nreach-data.onrender.com/api/sms/send-bulk-sms",
                formData,
                { headers: { "Content-Type": "multipart/form-data" }, timeout: 30000 }
            );

            if (res.data.success) {
                showNotification(
                    `SMS sent successfully! Sent: ${res.data.sent}, Skipped: ${res.data.skipped}`,
                    "success"
                );
            } else {
                showNotification("Processing completed with issues. Check console.", "warning");
                console.warn(res.data);
            }

            setRefresh(prev => !prev);
            setFile(null);
            setYear("");
            setSection("");
            setRollNo("");
            setFromDate("");
            setToDate("");
            setDepartment("");
            setAttendanceFilter("");
            setAcademicYear("");
            e.target.reset();
        } catch (err) {
            console.error(err.response?.data || err.message);
            showNotification(err.response?.data?.error || "Failed to send SMS.", "error");
        } finally {
            setLoading(false);
        }
    };

    const getNotificationStyle = () => {
        const baseStyle = {
            position: "fixed",
            top: "20px",
            left: "20px",
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
                        style={{ background: "none", border: "none", color: "white", fontSize: "18px", cursor: "pointer", marginLeft: "auto", padding: 0 }}
                    >✕</button>
                </div>
            )}

            <style>
                {`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}
            </style>

            <div style={{ background: "white", color: "#000", padding: "30px", borderRadius: "12px", maxWidth: "80%", margin: "10px auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <h2 style={{ marginBottom: "15px", fontWeight: "700" }}>📤 Upload Attendance Report</h2>
                <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Upload Excel File:</label>
                        <input type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files[0])} style={{ padding: "8px", width: "100%", borderRadius: "6px", border: "1px solid #888", color: "#000" }} />
                    </div>

                    {user?.role !== "hod" && (
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Department:</label>
                            <select value={department} onChange={(e) => setDepartment(e.target.value)} style={{ padding: "8px", width: "100%", borderRadius: "6px", border: "1px solid #888" }}>
                                <option value="">Select Department</option>
                                <option value="CSE">CSE</option>
                                <option value="ECE">ECE</option>
                                <option value="EEE">EEE</option>
                                <option value="MECH">MECH</option>
                                <option value="CIVIL">CIVIL</option>
                            </select>
                        </div>
                    )}

                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Attendance Filter:</label>
                        <select value={attendanceFilter} onChange={(e) => setAttendanceFilter(e.target.value)} style={{ padding: "8px", width: "100%", borderRadius: "6px", border: "1px solid #888" }}>
                            <option value="">Select Attendance</option>
                            <option value="<50">&lt;50%</option>
                            <option value="<65">&lt;65%</option>
                            <option value="<75">&lt;75%</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Academic Year:</label>
                        <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} style={{ padding: "8px", width: "100%", borderRadius: "6px", border: "1px solid #888" }}>
                            <option value="">Select Academic Year</option>
                            {academicYearsList.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>From Date:</label>
                        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ padding: "8px", width: "100%", borderRadius: "6px", border: "1px solid #888" }} />
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>To Date:</label>
                        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ padding: "8px", width: "100%", borderRadius: "6px", border: "1px solid #888" }} />
                    </div>

                    <div style={{ textAlign: "center" }}>
                        <button type="submit" disabled={loading} style={{ padding: "12px 24px", borderRadius: "8px", border: "none", cursor: loading ? "not-allowed" : "pointer", background: loading ? "#94a3b8" : "#2563eb", color: "#fff", fontWeight: "600", fontSize: "1rem" }}>
                            {loading ? "⏳ Sending..." : "🚀 Send SMS"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default UploadExcel;

