import React, { useEffect, useState } from "react";
import axios from "axios";
import SmsModal from "./SmsModal";

const SmsTable = ({ refresh }) => {
    const [smsRecords, setSmsRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterYear, setFilterYear] = useState("");
    const [filterSection, setFilterSection] = useState("");
    const [filterRollNo, setFilterRollNo] = useState("");
    const [selectedSms, setSelectedSms] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Check screen size for responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchSms = async () => {
        setLoading(true);
        try {
            //const res = await axios.get("https://multiple-sms-backend.onrender.com/api/sms/results");
            const res = await axios.get("http://localhost:3000/api/sms/results");
            setSmsRecords(res.data || []);
        } catch (err) {
            console.error("Error fetching SMS results:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSms();
    }, [refresh]);

    const filteredRecords = smsRecords.filter((sms) => {
        const yearMatch = filterYear ? sms.year === filterYear : true;
        const sectionMatch = filterSection ? sms.section === filterSection : true;
        const rollMatch = filterRollNo
            ? sms.rollNo?.toLowerCase().includes(filterRollNo.toLowerCase())
            : true;
        return yearMatch && sectionMatch && rollMatch;
    });

    return (
        <div style={{ marginTop: "10px" }}>
            <h2 style={{ marginBottom: "1rem" }}>📊 SMS Records</h2>

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
                {/* Year and Section in one row on mobile */}
                <div style={{
                    display: "flex",
                    gap: "12px",
                    flexDirection: isMobile ? "column" : "row",
                    width: isMobile ? "100%" : "auto"
                }}>
                    <label style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: isMobile ? "flex-start" : "center",
                        gap: "8px",
                        flex: isMobile ? "1" : "none",
                        width: isMobile ? "100%" : "auto"
                    }}>
                        {isMobile && <span style={{ fontWeight: 500 }}>Year:</span>}
                        <select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            style={{
                                padding: "8px 12px",
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                                flex: "1"
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

                    <label style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: isMobile ? "flex-start" : "center",
                        gap: "8px",
                        flex: isMobile ? "1" : "none",
                        width: isMobile ? "100%" : "auto"
                    }}>
                        {isMobile && <span style={{ fontWeight: 500 }}>Section:</span>}
                        <select
                            value={filterSection}
                            onChange={(e) => setFilterSection(e.target.value)}
                            style={{
                                padding: "8px 12px",
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                                flex: "1"
                            }}
                        >
                            <option value="">{isMobile ? "All Sections" : "All"}</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                        {!isMobile && <span style={{ fontWeight: 500 }}>Section</span>}
                    </label>
                </div>

                {/* Roll number search */}
                {/* Roll number search */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: isMobile ? "flex-start" : "center",
                        gap: "8px",
                        flex: isMobile ? "1" : "none",
                        width: isMobile ? "100%" : "auto"
                    }}
                >
                    <span style={{ fontWeight: 500 }}>Roll No:</span>
                    <input
                        type="text"
                        value={filterRollNo}
                        onChange={(e) => setFilterRollNo(e.target.value)}
                        placeholder="Search Roll No"
                        style={{
                            padding: "8px 8px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            flex: "1",
                            width: isMobile ? "50%" : "200px"
                        }}
                    />
                </div>


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
                        width: isMobile ? "100%" : "auto"
                    }}
                >
                    🔄 Refresh
                </button>
            </div>

            {
                loading ? (
                    <p>Loading...</p>
                ) : (
                    <div
                        style={{
                            overflowX: "auto",
                            borderRadius: "8px",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                            WebkitOverflowScrolling: "touch",
                            maxWidth: "100vw",
                            position: "relative"
                        }}
                    >
                        <div style={{
                            overflowX: isMobile ? "auto" : "hidden",
                            width: "100%"
                        }}>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    overflow: "hidden",
                                    borderRadius: "8px",
                                    minWidth: isMobile ? "700px" : "100%"
                                }}
                            >
                                <thead style={{
                                    background: "#3B82F6",
                                    color: "#fff",
                                    position: isMobile ? "sticky" : "relative",
                                    left: 0
                                }}>
                                    <tr>
                                        <th style={{ padding: "12px", position: isMobile ? "sticky" : "static", left: isMobile ? 0 : "auto" }}>RollNumber</th>
                                        <th style={{ padding: "12px" }}>Name</th>
                                        <th style={{ padding: "12px" }}>Phone Number</th>
                                        <th style={{ padding: "12px" }}>Year</th>
                                        <th style={{ padding: "12px" }}>Class</th>
                                        <th style={{ padding: "12px" }}>Status</th>
                                        <th style={{ padding: "12px" }}>Sent At</th>
                                        <th style={{ padding: "12px" }}>Acknowledged</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" style={{ textAlign: "center", padding: "1rem" }}>
                                                No records found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRecords.map((sms, i) => (
                                            <tr
                                                key={sms._id}
                                                style={{
                                                    background: i % 2 === 0 ? "#F9FAFB" : "#FFFFFF",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() => {
                                                    if (sms) setSelectedSms(sms);
                                                }}
                                            >
                                                <td style={{ padding: "12px", position: isMobile ? "sticky" : "static", left: isMobile ? 0 : "auto", background: i % 2 === 0 ? "#F9FAFB" : "#FFFFFF" }}>{sms.rollNo}</td>
                                                <td style={{ padding: "12px" }}>{sms.name}</td>
                                                <td style={{ padding: "12px" }}>{sms.phoneNumber}</td>
                                                <td style={{ padding: "12px" }}>{sms.year}</td>
                                                <td style={{ padding: "12px" }}>{sms.section}</td>
                                                <td
                                                    style={{
                                                        padding: "12px",
                                                        color:
                                                            sms.status === "sent"
                                                                ? "#16A34A"
                                                                : "#DC2626",
                                                        fontWeight: "600",
                                                    }}
                                                >
                                                    {sms.status?.toUpperCase?.()}
                                                </td>
                                                <td style={{ padding: "12px" }}>
                                                    {sms.createdAt
                                                        ? new Date(sms.createdAt).toLocaleString()
                                                        : "N/A"}
                                                </td>
                                                <td style={{ padding: "12px" }}>
                                                    {sms.seen ? "✅" : "❌"}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            {
                selectedSms && (
                    <SmsModal sms={selectedSms} onClose={() => setSelectedSms(null)} />
                )
            }
        </div >
    );
};

export default SmsTable;

