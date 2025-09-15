import React, { useEffect, useState } from "react";
import axios from "axios";
import SmsModal from "./SmsModal";

const SmsTable = ({ refresh }) => {
    const [smsRecords, setSmsRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterYear, setFilterYear] = useState("");
    const [selectedSms, setSelectedSms] = useState(null);

    const fetchSms = async () => {
        setLoading(true);
        try {
            //const res = await axios.get("https://multiple-sms-backend.onrender.com/api/sms/results");
            const res = await axios.get("http://localhost:3000/api/sms/results");

            setSmsRecords(res.data);
        } catch (err) {
            console.error("Error fetching SMS results:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSms();
    }, [refresh]);

    const filteredRecords = smsRecords.filter((sms) =>
        filterYear ? sms.year === filterYear : true
    );

    return (
        <div style={{ marginTop: "20px" }}>
            <h2 style={{ marginBottom: "1rem" }}>📊 SMS Records</h2>

            {/* Year Filter */}
            <div style={{ marginBottom: "15px" }}>
                {["I", "II", "III", "IV"].map((yr) => (
                    <button
                        key={yr}
                        onClick={() => setFilterYear(yr)}
                        style={{
                            marginRight: "10px",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            background: filterYear === yr ? "#2563EB" : "#3B82F6",
                            color: "#fff",
                            fontWeight: "600",
                            cursor: "pointer",
                        }}
                    >
                        {yr}
                    </button>
                ))}
                <button
                    onClick={() => setFilterYear("")}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "none",
                        background: "#6B7280",
                        color: "#fff",
                        fontWeight: "600",
                        cursor: "pointer",
                    }}
                >
                    All
                </button>
            </div>

            {/* Refresh */}
            <button
                onClick={fetchSms}
                style={{
                    padding: "8px 16px",
                    marginBottom: "15px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#10B981",
                    color: "#fff",
                    fontWeight: "600",
                    cursor: "pointer",
                }}
            >
                🔄 Refresh Table
            </button>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div
                    style={{
                        overflowX: "auto",
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    }}
                >
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            overflow: "hidden",
                            borderRadius: "8px",
                        }}
                    >
                        <thead style={{ background: "#3B82F6", color: "#fff" }}>
                            <tr>
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
                                    <td colSpan="6" style={{ textAlign: "center", padding: "1rem" }}>
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
                                        onClick={() => setSelectedSms(sms)}
                                    >
                                        <td style={{ padding: "12px" }}>{sms.name}</td>
                                        <td style={{ padding: "12px" }}>{sms.phoneNumber}</td>
                                        <td style={{ padding: "12px" }}>{sms.year}</td>
                                        <td style={{ padding: "12px" }}>{sms.section}</td>
                                        <td
                                            style={{
                                                padding: "12px",
                                                color: sms.status === "sent" ? "#16A34A" : "#DC2626",
                                                fontWeight: "600",
                                            }}
                                        >
                                            {sms.status.toUpperCase()}
                                        </td>
                                        <td style={{ padding: "12px" }}>
                                            {new Date(sms.createdAt).toLocaleString()}
                                        </td>
                                        <td style={{ padding: "12px" }}>{sms.seen ? "✅" : "❌"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Reusable Modal */}
            {selectedSms && (
                <SmsModal sms={selectedSms} onClose={() => setSelectedSms(null)} />
            )}
        </div>
    );
};

export default SmsTable;

/*
import React, { useEffect, useState } from "react";
import axios from "axios";

const SmsTable = ({ refresh }) => {
    const [smsRecords, setSmsRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterYear, setFilterYear] = useState("");
    const [selectedSms, setSelectedSms] = useState(null); // NEW
    const [showModal, setShowModal] = useState(false); // NEW

    const fetchSms = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:5000/api/sms/results");
            setSmsRecords(res.data);
        } catch (err) {
            console.error("Error fetching SMS results:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSms();
    }, [refresh]);

    const filteredRecords = smsRecords.filter((sms) =>
        filterYear ? sms.year === filterYear : true
    );

    // Handle row click
    const handleRowClick = (sms) => {
        setSelectedSms(sms);
        setShowModal(true);
    };

    return (
        <div style={{ marginTop: "20px" }}>
            <h2 style={{ marginBottom: "1rem" }}>📊 SMS Records</h2>

            <div style={{ marginBottom: "15px" }}>
                {["I", "II", "III", "IV"].map((yr) => (
                    <button
                        key={yr}
                        onClick={() => setFilterYear(yr)}
                        style={{
                            marginRight: "10px",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            background: filterYear === yr ? "#2563EB" : "#3B82F6",
                            color: "#fff",
                            fontWeight: "600",
                            cursor: "pointer",
                        }}
                    >
                        {yr}
                    </button>
                ))}
                <button
                    onClick={() => setFilterYear("")}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "none",
                        background: "#6B7280",
                        color: "#fff",
                        fontWeight: "600",
                        cursor: "pointer",
                    }}
                >
                    All
                </button>
            </div>

            <button
                onClick={fetchSms}
                style={{
                    padding: "8px 16px",
                    marginBottom: "15px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#10B981",
                    color: "#fff",
                    fontWeight: "600",
                    cursor: "pointer",
                }}
            >
                🔄 Refresh Table
            </button>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div
                    style={{
                        overflowX: "auto",
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    }}
                >
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            overflow: "hidden",
                            borderRadius: "8px",
                        }}
                    >
                        <thead style={{ background: "#3B82F6", color: "#fff" }}>
                            <tr>
                                <th style={{ padding: "12px" }}>Name</th>
                                <th style={{ padding: "12px" }}>Phone Number</th>
                                <th style={{ padding: "12px" }}>Year</th>
                                <th style={{ padding: "12px" }}>Status</th>
                                <th style={{ padding: "12px" }}>Sent At</th>
                                <th style={{ padding: "12px" }}>Acknowledged</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center", padding: "1rem" }}>
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
                                        onClick={() => handleRowClick(sms)}
                                    >
                                        <td style={{ padding: "12px" }}>{sms.name}</td>
                                        <td style={{ padding: "12px" }}>{sms.phoneNumber}</td>
                                        <td style={{ padding: "12px" }}>{sms.year}</td>
                                        <td
                                            style={{
                                                padding: "12px",
                                                color: sms.status === "sent" ? "#16A34A" : "#DC2626",
                                                fontWeight: "600",
                                            }}
                                        >
                                            {sms.status.toUpperCase()}
                                        </td>
                                        <td style={{ padding: "12px" }}>
                                            {new Date(sms.createdAt).toLocaleString()}
                                        </td>
                                        <td style={{ padding: "12px" }}>{sms.seen ? "✅" : "❌"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && selectedSms && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        style={{
                            background: "#fff",
                            padding: "20px",
                            borderRadius: "10px",
                            minWidth: "400px",
                            maxWidth: "600px",
                        }}
                        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
                    >
                        <h3>📩 SMS Details</h3>
                        <p><b>Name:</b> {selectedSms.name}</p>
                        <p><b>Phone:</b> {selectedSms.phoneNumber}</p>
                        <p><b>Year:</b> {selectedSms.year}</p>
                        <p><b>Status:</b> {selectedSms.status}</p>
                        <p><b>Sent At:</b> {new Date(selectedSms.createdAt).toLocaleString()}</p>
                        <p><b>Acknowledged:</b> {selectedSms.seen ? "✅ Yes" : "❌ No"}</p>

                        <button
                            onClick={() => setShowModal(false)}
                            style={{
                                marginTop: "15px",
                                padding: "10px 20px",
                                border: "none",
                                borderRadius: "6px",
                                background: "#DC2626",
                                color: "#fff",
                                fontWeight: "600",
                                cursor: "pointer",
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmsTable;
*/
