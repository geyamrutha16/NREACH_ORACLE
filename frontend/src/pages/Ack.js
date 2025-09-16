import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import watermarkLogo from "./logo.png";

const Ack = () => {
    const { smsId } = useParams();
    const [status, setStatus] = useState("Processing acknowledgment...");
    const [smsData, setSmsData] = useState(null);
    const [loading, setLoading] = useState(true);

    const receiptRef = useRef();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // 1. Acknowledge the SMS
                const ackRes = await axios.get(
                    `https://multiple-sms-backend.onrender.com/api/sms/ack/${smsId}`
                );
                setStatus(ackRes.data.message);

                // 2. Fetch SMS record details
                const recordRes = await axios.get(
                    `https://multiple-sms-backend.onrender.com/api/sms/record/${smsId}`
                );

                if (recordRes.data.success) {
                    setSmsData(recordRes.data.data);
                }

                // Trigger leaderboard refresh globally
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

    const handleDownloadPDF = () => {
        const element = receiptRef.current;
        const opt = {
            margin: 0.5,
            filename: `acknowledgment_${smsId}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        };
        html2pdf().set(opt).from(element).save();
    };

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "linear-gradient(135deg, #6366F1, #3B82F6)",
                }}
            >
                <div
                    style={{
                        background: "#fff",
                        padding: "2rem",
                        borderRadius: "12px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        textAlign: "center",
                    }}
                >
                    <h1
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            color: "#3B82F6",
                        }}
                    >
                        ⏳ Loading...
                    </h1>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                padding: "10px",
                background: "linear-gradient(135deg, #6366F1, #3B82F6)",
            }}
        >
            <div
                style={{
                    maxWidth: "800px",
                    margin: "0 auto",
                    background: "#fff",
                    padding: "1rem",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
                ref={receiptRef}
            >
                {/* ✅ College Header (visible in webpage + PDF) */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "1.6rem",
                        fontWeight: "bold",
                        marginBottom: "1rem",
                        textAlign: "center",
                        background: "#f9f9f9",
                    }}
                >
                    <img
                        src={watermarkLogo}
                        alt="Logo"
                        style={{ height: "40px", width: "40px", marginRight: "10px" }}
                    />
                    NARAYANA ENGINEERING COLLEGE GUDUR
                </div>

                <h1
                    style={{
                        fontSize: "1.4rem",
                        fontWeight: "bold",
                        color:
                            status.includes("Error") || status.includes("❌")
                                ? "#DC2626"
                                : "#16A34A",
                        marginBottom: "1.5rem",
                        textAlign: "center",
                    }}
                >
                    {status}
                </h1>

                {smsData && (
                    <div
                        style={{
                            marginTop: "1.5rem",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                            padding: "1.4rem",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "1.5rem",
                                fontWeight: "bold",
                                color: "#1F2937",
                                marginBottom: "1rem",
                            }}
                        >
                            📋 SMS Details
                        </h2>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                                gap: "1rem",
                            }}
                        >
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
                                <strong>Phone Number:</strong>{" "}
                                {smsData.phoneNumber?.startsWith("+91")
                                    ? `+91 ${smsData.phoneNumber.slice(3)}`
                                    : smsData.phoneNumber}
                            </div>
                            <div>
                                <strong>Attendance:</strong> {smsData.attendance}%
                            </div>
                            <div>
                                <strong>Status:</strong>
                                <span
                                    style={{
                                        color: smsData.status === "sent" ? "#16A34A" : "#DC2626",
                                        fontWeight: "600",
                                        marginLeft: "0.5rem",
                                    }}
                                >
                                    {smsData.status.toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <strong>Acknowledged:</strong>{" "}
                                {smsData.seen ? " ✅ Yes" : " ❌ No"}
                            </div>
                            <div>
                                <strong>Sent Date:</strong>{" "}
                                {new Date(smsData.createdAt).toLocaleString()}
                            </div>
                        </div>

                        {smsData.fromDate && smsData.toDate && (
                            <div
                                style={{
                                    marginTop: "1rem",
                                    padding: "1rem",
                                    background: "#F3F4F6",
                                    borderRadius: "6px",
                                }}
                            >
                                <strong>Attendance Period:</strong> {smsData.fromDate} to{" "}
                                {smsData.toDate}
                            </div>
                        )}

                        <div
                            style={{
                                marginTop: "1.5rem",
                                padding: "1rem",
                                background: "#F0F9FF",
                                borderRadius: "6px",
                            }}
                        >
                            <strong>Message Sent:</strong>
                            <p
                                style={{
                                    marginTop: "0.5rem",
                                    color: "#374151",
                                    lineHeight: "1.5",
                                }}
                            >
                                {smsData.message}
                            </p>
                        </div>
                    </div>
                )}

                {smsData && (
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <button
                            onClick={handleDownloadPDF}
                            style={{
                                background: "#3B82F6",
                                color: "#fff",
                                padding: "0.75rem 1.5rem",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "1rem",
                                fontWeight: "600",
                                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                                transition: "background 0.3s",
                            }}
                            onMouseOver={(e) =>
                                (e.currentTarget.style.background = "#2563EB")
                            }
                            onMouseOut={(e) =>
                                (e.currentTarget.style.background = "#3B82F6")
                            }
                        >
                            📥 Download Acknowledgment Receipt
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Ack;
/*
import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Marquee from "./Marquee";
import html2pdf from "html2pdf.js";
import watermarkLogo from "./logo.png";

const Ack = () => {
    const { smsId } = useParams();
    const [status, setStatus] = useState("Processing acknowledgment...");
    const [smsData, setSmsData] = useState(null);
    const [loading, setLoading] = useState(true);

    const receiptRef = useRef();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // 1. Acknowledge the SMS
                const ackRes = await axios.get(
                    `https://multiple-sms-backend.onrender.com/api/sms/ack/${smsId}`
                );
                setStatus(ackRes.data.message);

                // 2. Fetch SMS record details
                const recordRes = await axios.get(
                    `https://multiple-sms-backend.onrender.com/api/sms/record/${smsId}`
                );

                if (recordRes.data.success) {
                    setSmsData(recordRes.data.data);
                }

                // Trigger leaderboard refresh globally
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

    const handleDownloadPDF = () => {
        const element = receiptRef.current;
        const opt = {
            margin: 0.5,
            filename: `acknowledgment_${smsId}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        };
        html2pdf().set(opt).from(element).save();
    };

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "linear-gradient(135deg, #6366F1, #3B82F6)",
                }}
            >
                <div
                    style={{
                        background: "#fff",
                        padding: "2rem",
                        borderRadius: "12px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        textAlign: "center",
                    }}
                >
                    <h1
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            color: "#3B82F6",
                        }}
                    >
                        ⏳ Loading...
                    </h1>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                padding: "10px",
                background: "linear-gradient(135deg, #6366F1, #3B82F6)",
            }}
        >
            <style>
                {`
          @media screen {
            .pdf-only { display: none; }
          }
          @media print {
            .screen-only { display: none; }
            .pdf-only {
              display: flex;
              justify-content: center;
              align-items: center;
              font-size: 1.6rem;
              font-weight: bold;
              margin-bottom: 1rem;
              text-align: center;
            }
            .pdf-only img {
              height: 40px;
              width: 40px;
              margin-right: 10px;
            }
          }
        `}
            </style>

            <div
                style={{
                    maxWidth: "800px",
                    margin: "0 auto",
                    background: "#fff",
                    padding: "1rem",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
                ref={receiptRef}
            >
                <div className="screen-only">
                    <Marquee />
                </div>

                <div className="pdf-only">
                    <img src={watermarkLogo} alt="Logo" />
                    NARAYANA ENGINEERING COLLEGE GUDUR
                </div>

                <h1
                    style={{
                        fontSize: "1.4rem",
                        fontWeight: "bold",
                        color:
                            status.includes("Error") || status.includes("❌")
                                ? "#DC2626"
                                : "#16A34A",
                        marginBottom: "1.5rem",
                        textAlign: "center",
                    }}
                >
                    {status}
                </h1>

                {smsData && (
                    <div
                        style={{
                            marginTop: "1.5rem",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                            padding: "1.4rem",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "1.5rem",
                                fontWeight: "bold",
                                color: "#1F2937",
                                marginBottom: "1rem",
                            }}
                        >
                            📋 SMS Details
                        </h2>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                                gap: "1rem",
                            }}
                        >
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
                                <strong>Phone Number:</strong>{" "}
                                {smsData.phoneNumber?.startsWith("+91")
                                    ? `+91 ${smsData.phoneNumber.slice(3)}`
                                    : smsData.phoneNumber}
                            </div>
                            <div>
                                <strong>Attendance:</strong> {smsData.attendance}%
                            </div>
                            <div>
                                <strong>Status:</strong>
                                <span
                                    style={{
                                        color: smsData.status === "sent" ? "#16A34A" : "#DC2626",
                                        fontWeight: "600",
                                        marginLeft: "0.5rem",
                                    }}
                                >
                                    {smsData.status.toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <strong>Acknowledged:</strong>{" "}
                                {smsData.seen ? " ✅ Yes" : " ❌ No"}
                            </div>
                            <div>
                                <strong>Sent Date:</strong>{" "}
                                {new Date(smsData.createdAt).toLocaleString()}
                            </div>
                        </div>

                        {smsData.fromDate && smsData.toDate && (
                            <div
                                style={{
                                    marginTop: "1rem",
                                    padding: "1rem",
                                    background: "#F3F4F6",
                                    borderRadius: "6px",
                                }}
                            >
                                <strong>Attendance Period:</strong> {smsData.fromDate} to{" "}
                                {smsData.toDate}
                            </div>
                        )}

                        <div
                            style={{
                                marginTop: "1.5rem",
                                padding: "1rem",
                                background: "#F0F9FF",
                                borderRadius: "6px",
                            }}
                        >
                            <strong>Message Sent:</strong>
                            <p
                                style={{
                                    marginTop: "0.5rem",
                                    color: "#374151",
                                    lineHeight: "1.5",
                                }}
                            >
                                {smsData.message}
                            </p>
                        </div>
                    </div>
                )}

                {smsData && (
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <button
                            onClick={handleDownloadPDF}
                            style={{
                                background: "#3B82F6",
                                color: "#fff",
                                padding: "0.75rem 1.5rem",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "1rem",
                                fontWeight: "600",
                                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                                transition: "background 0.3s",
                            }}
                            onMouseOver={(e) =>
                                (e.currentTarget.style.background = "#2563EB")
                            }
                            onMouseOut={(e) =>
                                (e.currentTarget.style.background = "#3B82F6")
                            }
                        >
                            📥 Download Acknowledgment Receipt
                        </button>
                    </div>
                )}
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