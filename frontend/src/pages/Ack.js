import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const Ack = () => {
    const { smsId } = useParams();
    const [status, setStatus] = useState("Processing acknowledgment...");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [smsData, setSmsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // 1. First acknowledge the SMS
                const ackRes = await axios.get(
                    `https://multiple-sms-backend.onrender.com/api/sms/ack/${smsId}`
                );
                setStatus(ackRes.data.message);
                if (ackRes.data.phoneNumber) setPhoneNumber(ackRes.data.phoneNumber);

                // 2. Then fetch the full SMS record details
                const recordRes = await axios.get(
                    `https://multiple-sms-backend.onrender.com/api/sms/record/${smsId}`
                );

                if (recordRes.data.success) {
                    console.log("Fetched SMS Record:", recordRes.data.data);
                    setSmsData(recordRes.data.data);
                }

                // ✅ Trigger leaderboard refresh globally
                const event = new CustomEvent("smsAcknowledged", { detail: smsId });
                window.dispatchEvent(event);

            } catch (err) {
                console.error("Error in Ack component:", err);
                setStatus("❌ Error processing acknowledgment.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [smsId]);

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #6366F1, #3B82F6)" }}>
                <div style={{ background: "#fff", padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", textAlign: "center" }}>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#3B82F6" }}>
                        ⏳ Loading...
                    </h1>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", padding: "20px", background: "linear-gradient(135deg, #6366F1, #3B82F6)" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto", background: "#fff", padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", color: status.includes("Error") || status.includes("❌") ? "#DC2626" : "#16A34A", marginBottom: "1.5rem", textAlign: "center" }}>
                    {status}
                </h1>

                {phoneNumber && (
                    <p style={{ marginBottom: "1.5rem", color: "#6B7280", textAlign: "center" }}>
                        Acknowledgment for <strong>{phoneNumber}</strong>
                    </p>
                )}

                {smsData && (
                    <div style={{ marginTop: "2rem", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "1.5rem" }}>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1F2937", marginBottom: "1rem" }}>
                            📋 SMS Record Details
                        </h2>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                            <div>
                                <strong>Name:</strong> {smsData.name}
                            </div>
                            <div>
                                <strong>Roll Number:</strong> {smsData.rollNo}
                            </div>
                            <div>
                                <strong>Year:</strong> {smsData.year}
                            </div>
                            <div>
                                <strong>Section:</strong> {smsData.section}
                            </div>
                            <div>
                                <strong>Attendance:</strong> {smsData.attendance}%
                            </div>
                            <div>
                                <strong>Status:</strong>
                                <span style={{
                                    color: smsData.status === "sent" ? "#16A34A" : "#DC2626",
                                    fontWeight: "600",
                                    marginLeft: "0.5rem"
                                }}>
                                    {smsData.status.toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <strong>Acknowledged:</strong>
                                {smsData.seen ? " ✅ Yes" : " ❌ No"}
                            </div>
                            <div>
                                <strong>Sent Date:</strong> {new Date(smsData.createdAt).toLocaleString()}
                            </div>
                        </div>

                        {smsData.fromDate && smsData.toDate && (
                            <div style={{ marginTop: "1rem", padding: "1rem", background: "#F3F4F6", borderRadius: "6px" }}>
                                <strong>Attendance Period:</strong> {smsData.fromDate} to {smsData.toDate}
                            </div>
                        )}

                        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#F0F9FF", borderRadius: "6px" }}>
                            <strong>Message Sent:</strong>
                            <p style={{ marginTop: "0.5rem", color: "#374151", lineHeight: "1.5" }}>
                                {smsData.message}
                            </p>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: "2rem", textAlign: "center" }}>
                    <button
                        onClick={() => window.location.href = "/"}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#3B82F6",
                            color: "#fff",
                            fontWeight: "600",
                            cursor: "pointer"
                        }}
                    >
                        ← Return to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Ack;
/*
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const Ack = () => {
    const { smsId } = useParams();
    const [status, setStatus] = useState("Processing...");
    const [phoneNumber, setPhoneNumber] = useState("");

    useEffect(() => {
        const fetchAck = async () => {
            try {
                const res = await axios.get(`https://multiple-sms-backend.onrender.com/api/sms/ack/${smsId}`);
                setStatus(res.data.message);
                if (res.data.phoneNumber) setPhoneNumber(res.data.phoneNumber);

                // ✅ Trigger leaderboard refresh globally
                const event = new CustomEvent("smsAcknowledged", { detail: smsId });
                window.dispatchEvent(event);
            } catch (err) {
                setStatus("❌ Error acknowledging SMS.");
            }
        };

        fetchAck();
        const interval = setInterval(fetchAck, 5000);
        return () => clearInterval(interval);
    }, [smsId]);

    return (
        <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #6366F1, #3B82F6)" }}>
            <div style={{ background: "#fff", padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", textAlign: "center", maxWidth: "400px" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: status.includes("Error") || status.includes("❌") ? "#DC2626" : "#16A34A" }}>
                    {status}
                </h1>
                {phoneNumber && <p style={{ marginTop: "1rem", color: "#6B7280" }}>Acknowledgment for <strong>{phoneNumber}</strong></p>}
            </div>
        </div>
    );
};

export default Ack;
*/

/*
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const Ack = () => {
    const { smsId } = useParams();
    const [status, setStatus] = useState("Processing...");
    const [phoneNumber, setPhoneNumber] = useState(""); // ✅ add state for phone number

    useEffect(() => {
        let interval;
        console.log("smsId from useParams:", smsId);

        const fetchAck = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/sms/ack/${smsId}`);
                setStatus(res.data.message);

                // ✅ set phone number if returned from backend
                if (res.data.phoneNumber) {
                    setPhoneNumber(res.data.phoneNumber);
                }
            } catch (err) {
                setStatus("❌ Error acknowledging SMS.");
            }
        };

        fetchAck();
        interval = setInterval(fetchAck, 5000);

        return () => clearInterval(interval);
    }, [smsId]);

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)",
            }}
        >
            <div
                style={{
                    background: "#fff",
                    padding: "2rem",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    textAlign: "center",
                    maxWidth: "400px",
                }}
            >
                <h1
                    style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: status.includes("Error") || status.includes("❌") ? "#DC2626" : "#16A34A",
                    }}
                >
                    {status}
                </h1>
                {phoneNumber && (
                    <p style={{ marginTop: "1rem", color: "#6B7280" }}>
                        Acknowledgment for <strong>{phoneNumber}</strong>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Ack;
*/