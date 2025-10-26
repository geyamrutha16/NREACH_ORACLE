import React, { useState, useEffect } from "react";
import axios from "axios";

const UploadExcel = ({ setRefresh, user }) => {
    const [file, setFile] = useState(null);
    const [year, setYear] = useState("");
    const [section, setSection] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [department, setDepartment] = useState("");
    const [attendanceFilter, setAttendanceFilter] = useState("");
    const [academicYear, setAcademicYear] = useState("");
    const [templates, setTemplates] = useState([]);
    const [originalTemplateId, setOriginalTemplateId] = useState(""); // selected template id
    const [templateId, settemplateId] = useState(""); // selected template id
    const [templateName, setTemplateName] = useState(""); // template type (default/warning/final)
    const [editedTemplate, setEditedTemplate] = useState(""); // for editing
    const [editingTemplate, setEditingTemplate] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: "", type: "" });
    const [academicYearsList, setAcademicYearsList] = useState([]);

    const todayStr = new Date().toISOString().split("T")[0];

    // Dynamic Academic Years
    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let y = 2022; y <= currentYear + 1; y++) years.push(`${y}-${y + 1}`);
        setAcademicYearsList(years);
    }, []);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/sms/templates");
                setTemplates(res.data); // <- use res.data directly
            } catch (err) {
                console.error("Error loading templates:", err);
            }
        };
        fetchTemplates();
    }, []);


    const handleTemplateSelect = (id) => {
        setOriginalTemplateId(id);
        settemplateId(id);
        setEditingTemplate(false);

        const selectedTemplate = templates.find((t) => t.ID === Number(id));
        if (!selectedTemplate) return;

        setEditedTemplate(selectedTemplate.TEMPLATE_TEXT);
        setTemplateName(selectedTemplate.TEMPLATE_NAME);
    };

    const showNotification = (message, type = "info") => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 4000);
    };

    const validateFields = () => {
        const missing = [];
        if (!file) missing.push("Excel file");
        if (!fromDate) missing.push("From Date");
        if (!toDate) missing.push("To Date");
        if (!attendanceFilter) missing.push("Attendance Filter");
        if (!academicYear) missing.push("Academic Year");
        if (!originalTemplateId) missing.push("Message Template");
        if (user?.role !== "hod" && !department) missing.push("Department");

        if (missing.length) return `Please fill ${missing.join(", ")}.`;
        if (new Date(toDate) < new Date(fromDate)) return "End date cannot be earlier than start date.";
        if (new Date(fromDate) > new Date()) return "From Date cannot be in the future.";
        if (new Date(toDate) > new Date()) return "To Date cannot be in the future.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errorMsg = validateFields();
        if (errorMsg) {
            showNotification(errorMsg, "warning");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("year", year);
        formData.append("section", section);
        formData.append("fromDate", fromDate);
        formData.append("toDate", toDate);
        formData.append("attendanceFilter", attendanceFilter);
        formData.append("academicYear", academicYear);
        formData.append("department", user?.role === "hod" ? user.department : department);
        formData.append("templateId", templateId);

        try {
            setLoading(true);
            showNotification("Processing Excel and sending SMS...", "info");

            const response = await axios.post(
                "http://localhost:5000/api/sms/send-bulk-sms",
                formData,
                { headers: { "Content-Type": "multipart/form-data" }, timeout: 60000 }
            );

            const data = response.data;
            if (data.success) {
                showNotification(`✅ Upload Complete! Sent: ${data.sent}, Skipped: ${data.skipped}`, "success");
            } else {
                showNotification("⚠️ Upload completed with some issues.", "warning");
            }

            setRefresh((prev) => !prev);
            e.target.reset();
            setFile(null);
            setYear("");
            setSection("");
            setFromDate("");
            setToDate("");
            setDepartment("");
            setAttendanceFilter("");
            setAcademicYear("");
            setOriginalTemplateId("");
            settemplateId("");
            setTemplateName("");
            setShowPreview(false);
        } catch (err) {
            console.error("❌ Upload error:", err);
            showNotification(err.response?.data?.error || "Server error. Try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEditedTemplate = async () => {
        if (!editedTemplate) {
            showNotification("Template text cannot be empty", "warning");
            return;
        }
        if (!originalTemplateId) {
            showNotification("Please select a template first", "warning");
            return;
        }
        if (!user?.username) {
            showNotification("User info not loaded properly.", "error");
            return;
        }

        try {
            const res = await axios.post("http://localhost:5000/api/sms/templates/save-edited", {
                originalTemplateId,
                templateName, // now included
                templateText: editedTemplate,
                username: user.username,
            });

            if (res.data.success) {
                showNotification("Template saved successfully!", "success");
                setEditingTemplate(false);
            }
        } catch (err) {
            console.error(err);
            showNotification("Failed to save template", "error");
        }
    };

    const notificationStyles = {
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "14px 22px",
        borderRadius: "10px",
        color: "#fff",
        fontWeight: "600",
        zIndex: 1000,
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        background:
            notification.type === "success"
                ? "linear-gradient(135deg,#16a34a,#15803d)"
                : notification.type === "error"
                    ? "linear-gradient(135deg,#dc2626,#b91c1c)"
                    : notification.type === "warning"
                        ? "linear-gradient(135deg,#d97706,#b45309)"
                        : "linear-gradient(135deg,#2563eb,#1d4ed8)",
        opacity: notification.show ? 1 : 0,
        transition: "opacity 0.3s ease",
        display: "flex",
        alignItems: "center",
        gap: "10px",
    };

    return (
        <>
            {notification.show && (
                <div style={notificationStyles}>
                    {notification.message}
                    <button
                        onClick={() => setNotification({ show: false, message: "", type: "" })}
                        style={{
                            background: "none",
                            border: "none",
                            color: "white",
                            fontSize: "18px",
                            marginLeft: "auto",
                            cursor: "pointer",
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}

            <div
                style={{
                    background: "#fff",
                    color: "#000",
                    padding: "30px",
                    borderRadius: "12px",
                    maxWidth: "80%",
                    margin: "20px auto",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
            >
                <h2 style={{ marginBottom: "20px", fontWeight: "700" }}>📊 Upload Attendance Report</h2>

                <form onSubmit={handleSubmit}>
                    {/* Excel File */}
                    <div style={{ marginBottom: "20px", textAlign: "left" }}>
                        <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>Upload Excel File:</label>
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => setFile(e.target.files[0])}
                            style={{ width: "100%", padding: "8px", border: "1px solid #888", borderRadius: "6px" }}
                        />
                    </div>

                    {/* Department */}
                    {user?.role !== "hod" && (
                        <div style={{ marginBottom: "20px", textAlign: "left" }}>
                            <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>Department:</label>
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                style={{ width: "100%", padding: "8px", border: "1px solid #888", borderRadius: "6px" }}
                            >
                                <option value="">Select Department</option>
                                <option value="CSE">CSE</option>
                                <option value="ECE">ECE</option>
                                <option value="EEE">EEE</option>
                                <option value="MECH">MECH</option>
                                <option value="CIVIL">CIVIL</option>
                            </select>
                        </div>
                    )}

                    {/* Attendance Filter */}
                    <div style={{ marginBottom: "20px", textAlign: "left" }}>
                        <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>Attendance Filter:</label>
                        <select
                            value={attendanceFilter}
                            onChange={(e) => setAttendanceFilter(e.target.value)}
                            style={{ width: "100%", padding: "8px", border: "1px solid #888", borderRadius: "6px" }}
                        >
                            <option value="">Select Filter</option>
                            <option value="<50">&lt;50%</option>
                            <option value="<65">&lt;65%</option>
                            <option value="<75">&lt;75%</option>
                        </select>
                    </div>

                    {/* Academic Year */}
                    <div style={{ marginBottom: "20px", textAlign: "left" }}>
                        <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>Academic Year:</label>
                        <select
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            style={{ width: "100%", padding: "8px", border: "1px solid #888", borderRadius: "6px" }}
                        >
                            <option value="">Select Academic Year</option>
                            {academicYearsList.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    {/* Message Template */}
                    <div style={{ marginBottom: "20px", textAlign: "left" }}>
                        <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>Message Template:</label>
                        <select value={originalTemplateId} onChange={(e) => handleTemplateSelect(e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid #888", borderRadius: "6px" }}
                        >
                            <option value="">Select Template</option>
                            {templates?.map((t) => (
                                <option key={t.ID} value={t.ID}>{t.TEMPLATE_NAME}</option>
                            ))}

                        </select>

                        {originalTemplateId && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setShowPreview((prev) => !prev)}
                                    style={{
                                        marginTop: "10px",
                                        padding: "8px 14px",
                                        background: "#16a34a",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                    }}
                                >
                                    {showPreview ? "Hide Preview" : "Preview Template Message"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingTemplate(true)}
                                    style={{
                                        marginTop: "10px",
                                        marginLeft: "10px",
                                        padding: "8px 14px",
                                        background: "#2563eb",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                    }}
                                >
                                    ✏️ Edit Template
                                </button>
                            </>
                        )}

                        {editingTemplate && (
                            <div style={{ marginTop: "10px" }}>
                                <textarea
                                    value={editedTemplate}
                                    onChange={(e) => setEditedTemplate(e.target.value)}
                                    rows={6}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #888",
                                        fontFamily: "monospace",
                                    }}
                                />
                                <div style={{ marginTop: "10px" }}>
                                    <button
                                        type="button"
                                        onClick={handleSaveEditedTemplate}
                                        style={{
                                            marginRight: "10px",
                                            padding: "8px 14px",
                                            background: "#16a34a",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                        }}
                                    >
                                        💾 Save Template
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingTemplate(false)}
                                        style={{
                                            padding: "8px 14px",
                                            background: "#dc2626",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                        }}
                                    >
                                        ✕ Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {showPreview && (
                            <div
                                style={{
                                    marginTop: "10px",
                                    background: "#f3f4f6",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: "1px solid #ccc",
                                    whiteSpace: "pre-line",
                                    fontFamily: "monospace",
                                }}
                            >
                                {editedTemplate}
                            </div>
                        )}
                    </div>

                    {/* Dates */}
                    <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "1fr 1fr" }}>
                        <div>
                            <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>From Date:</label>
                            <input
                                type="date"
                                value={fromDate}
                                max={todayStr}
                                onChange={(e) => setFromDate(e.target.value)}
                                style={{ width: "100%", padding: "8px", border: "1px solid #888", borderRadius: "6px" }}
                            />
                        </div>
                        <div>
                            <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>To Date:</label>
                            <input
                                type="date"
                                value={toDate}
                                max={todayStr}
                                onChange={(e) => setToDate(e.target.value)}
                                style={{ width: "100%", padding: "8px", border: "1px solid #888", borderRadius: "6px" }}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div style={{ marginTop: "25px", textAlign: "left" }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: "12px 24px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: loading ? "not-allowed" : "pointer",
                                background: loading ? "#9ca3af" : "#2563eb",
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
        </>
    );
};

export default UploadExcel;
