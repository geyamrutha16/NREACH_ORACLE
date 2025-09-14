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
                const res = await axios.get(`http://localhost:5000/api/sms/ack/${smsId}`);
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