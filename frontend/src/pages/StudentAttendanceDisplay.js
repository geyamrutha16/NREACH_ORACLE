import React, { useEffect, useState } from "react";
import axios from "axios";
import SmsModal from "./SmsModal";

const StudentAttendanceDisplay = ({ refresh, phone }) => {
    console.log("StudentAttendanceDisplay Phone:", phone);
    const [smsRecords, setSmsRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterYear, setFilterYear] = useState("");
    const [selectedSms, setSelectedSms] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const loginRole = localStorage.getItem("role") || "operator";

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const fetchSms = async () => {
        console.log("Fetching SMS for phone:", phone);
        const token = localStorage.getItem("token");
        if (!token || !phone) return;
        setLoading(true);
        try {
            const res = await axios.post(
                "http://localhost:5000/api/student/data",
                { phone },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(res.data);
            // Map Oracle fields to frontend-friendly keys
            const mapped = (res.data.attendance || []).map((sms) => ({
                id: sms.SMS_ID || sms.ID,
                rollNo: sms.ROLL_NO,
                name: sms.NAME,
                phoneNumber: sms.PHONE_NUMBER,
                year: sms.YEAR,
                section: sms.SECTION,
                department: sms.DEPARTMENT || sms.UPLOADED_DEPARTMENT,
                attendance: sms.ATTENDANCE,
                status: sms.STATUS,
                seen: sms.SEEN,
                createdAt: sms.CREATED_AT,
            }));
            setSmsRecords(mapped);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSms();
    }, [refresh, phone]);

    const filteredRecords = smsRecords.filter((sms) =>
        filterYear ? sms.year === filterYear : true
    );

    const clearFilters = () => setFilterYear("");

    return (
        <div style={{ marginTop: "10px" }}>
            <h2 style={{ marginBottom: "1rem", textAlign: "center" }}>📊 SMS TrackBoard</h2>

            {/* Filters */}
            <div
                style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: isMobile ? "12px" : "20px",
                    marginBottom: "20px",
                    alignItems: isMobile ? "stretch" : "center",
                    flexWrap: "wrap",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        flexDirection: isMobile ? "column" : "row",
                        width: isMobile ? "100%" : "auto",
                    }}
                >
                    <label
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: isMobile ? "flex-start" : "center",
                            gap: "8px",
                            flex: isMobile ? "1" : "none",
                            width: isMobile ? "100%" : "auto",
                        }}
                    >
                        {isMobile && <span style={{ fontWeight: 500 }}>Year:</span>}
                        <select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            style={{
                                padding: "8px 12px",
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                                flex: "1",
                            }}
                        >
                            <option value="">{isMobile ? "All Years" : "All"}</option>
                            <option value="I">I</option>
                            <option value="II">II</option>
                            <option value="III">III</option>
                            <option value="IV">IV</option>
                        </select>
                        {!isMobile && <span style={{ fontWeight: 500 }}>Year</span>}
                    </label>

                    <button
                        onClick={fetchSms}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#10B981",
                            color: "#fff",
                            fontWeight: "600",
                            cursor: "pointer",
                            width: isMobile ? "100%" : "auto",
                        }}
                    >
                        🔄 Refresh
                    </button>

                    <button
                        onClick={clearFilters}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#F59E0B",
                            color: "#fff",
                            fontWeight: "600",
                            cursor: "pointer",
                            width: isMobile ? "100%" : "auto",
                        }}
                    >
                        🧹 Clear Filters
                    </button>
                </div>

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div
                        style={{
                            overflowX: "auto",
                            borderRadius: "8px",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                            WebkitOverflowScrolling: "touch",
                            maxWidth: "100vw",
                            position: "relative",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <div style={{ overflowX: isMobile ? "auto" : "hidden", width: "100%" }}>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    overflow: "hidden",
                                    borderRadius: "8px",
                                    minWidth: isMobile ? "700px" : "100%",
                                }}
                            >
                                <thead
                                    style={{
                                        background: "#3B82F6",
                                        color: "#fff",
                                        position: isMobile ? "sticky" : "relative",
                                        left: 0,
                                    }}
                                >
                                    <tr>
                                        <th style={{ padding: "12px", position: isMobile ? "sticky" : "static", left: isMobile ? 0 : "auto" }}>
                                            RollNumber
                                        </th>
                                        <th style={{ padding: "12px" }}>Name</th>
                                        <th style={{ padding: "12px" }}>Phone Number</th>
                                        <th style={{ padding: "12px" }}>Year</th>
                                        <th style={{ padding: "12px" }}>Class</th>
                                        {loginRole === "operator" && <th style={{ padding: "12px" }}>Department</th>}
                                        <th style={{ padding: "12px" }}>Attendance %</th>
                                        <th style={{ padding: "12px" }}>Status</th>
                                        <th style={{ padding: "12px" }}>Sent At</th>
                                        <th style={{ padding: "12px" }}>Acknowledged</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={loginRole === "operator" ? 9 : 8} style={{ textAlign: "center", padding: "1rem" }}>
                                                No records found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRecords.map((sms, i) => (
                                            <tr
                                                key={sms.id}
                                                style={{ background: i % 2 === 0 ? "#F9FAFB" : "#FFFFFF", cursor: "pointer" }}
                                                onClick={() => setSelectedSms(sms)}
                                            >
                                                <td style={{ padding: "12px", position: isMobile ? "sticky" : "static", left: isMobile ? 0 : "auto", background: i % 2 === 0 ? "#F9FAFB" : "#FFFFFF" }}>
                                                    {sms.rollNo}
                                                </td>
                                                <td style={{ padding: "12px" }}>{sms.name}</td>
                                                <td style={{ padding: "12px" }}>{sms.phoneNumber}</td>
                                                <td style={{ padding: "12px" }}>{sms.year}</td>
                                                <td style={{ padding: "12px" }}>{sms.section}</td>
                                                {loginRole === "operator" && <td style={{ padding: "12px" }}>{sms.department}</td>}
                                                <td style={{ padding: "12px" }}>{sms.attendance ?? "N/A"}%</td>
                                                <td style={{ padding: "12px", color: sms.status?.toLowerCase() === "sent" || sms.status?.toLowerCase() === "delivered" ? "#16A34A" : "#DC2626", fontWeight: "600" }}>
                                                    {sms.status?.toUpperCase?.()}
                                                </td>
                                                <td style={{ padding: "12px" }}>{sms.createdAt ? new Date(sms.createdAt).toLocaleString() : "N/A"}</td>
                                                <td style={{ padding: "12px" }}>{sms.seen ? "✅" : "❌"}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedSms && <SmsModal sms={selectedSms} onClose={() => setSelectedSms(null)} />}
            </div>
        </div>
    );
};

export default StudentAttendanceDisplay;
