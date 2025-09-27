import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import watermarkLogo from "./logo.png";
import i18n from "../i18n";
import { useTranslation } from "react-i18next";
import VoiceAgent from "../VoiceAgent";

const Ack = () => {
    const { smsId } = useParams();
    const [status, setStatus] = useState("Processing acknowledgment...");
    const [smsData, setSmsData] = useState(null);
    const [translatedMessage, setTranslatedMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const { t } = useTranslation();
    const receiptRef = useRef();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const ackRes = await axios.get(
                    `https://nreach-data.onrender.com/api/sms/ack/${smsId}`
                );
                setStatus(ackRes.data.message);

                const recordRes = await axios.get(
                    `https://nreach-data.onrender.com/api/sms/record/${smsId}`
                );

                if (recordRes.data.success) {
                    setSmsData(recordRes.data.data);
                    setTranslatedMessage(recordRes.data.data.message); // default text
                }

                const event = new CustomEvent("smsAcknowledged", { detail: smsId });
                window.dispatchEvent(event);
            } catch (err) {
                console.error("Error in Ack component:", err);
                setStatus("❌ " + t("errorProcessingAck"));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [smsId, t]);

    // Translate backend message when language changes
    useEffect(() => {
        if (!smsData?.message) return;

        const translate = async () => {
            try {
                const lang = i18n.language;
                if (lang === "en") {
                    setTranslatedMessage(smsData.message);
                    return;
                }

                const res = await fetch(
                    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
                        smsData.message
                    )}&langpair=en|${lang}`
                );
                const data = await res.json();
                setTranslatedMessage(data.responseData.translatedText);
            } catch (error) {
                console.error("Translation error:", error);
                setTranslatedMessage(smsData.message); // fallback
            }
        };

        translate();
    }, [i18n.language, smsData]);

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
                        ⏳ {t("loading")}
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
            <div style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "10px"
            }}>
                {/* Voice button (speaker) */}
                <VoiceAgent targetRef={receiptRef} />
                {/* Language selector */}
                <select
                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                    value={i18n.language}
                    style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        minWidth: "120px",
                        marginRight: "50px",
                    }}
                >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी</option>
                    <option value="te">తెలుగు</option>
                    <option value="ta">தமிழ்</option>
                </select>
            </div>

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
                        padding: "10px",
                    }}
                >
                    <img
                        src={watermarkLogo}
                        alt="Logo"
                        style={{ height: "40px", width: "40px", marginRight: "10px" }}
                    />
                    {t("collegeName")}

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
                            {t("smsDetails")}
                        </h2>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                                gap: "1rem",
                            }}
                        >
                            <div>
                                <strong>{t("name")}:</strong> {smsData.name}
                            </div>
                            <div>
                                <strong>{t("rollNumber")}:</strong> {smsData.rollNo}
                            </div>
                            <div>
                                <strong>{t("year")}:</strong> {smsData.year}
                            </div>
                            <div>
                                <strong>{t("section")}:</strong> {smsData.section}
                            </div>
                            <div>
                                <strong>{t("phoneNumber")}:</strong>{" "}
                                {smsData.phoneNumber?.startsWith("+91")
                                    ? `+91 ${smsData.phoneNumber.slice(3)}`
                                    : smsData.phoneNumber}
                            </div>
                            <div>
                                <strong>{t("attendance")}:</strong> {smsData.attendance}%
                            </div>
                            <div>
                                <strong>{t("status")}:</strong>
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
                                <strong>{t("acknowledged")}:</strong>{" "}
                                {smsData.seen ? " ✅ " + t("yes") : " ❌ " + t("no")}
                            </div>
                            <div>
                                <strong>{t("sentDate")}:</strong>{" "}
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
                                <strong>{t("attendancePeriod")}:</strong>{" "}
                                {smsData.fromDate} {t("to")} {smsData.toDate}
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
                            <strong>{t("messageSent")}:</strong>
                            <p
                                style={{
                                    marginTop: "0.5rem",
                                    color: "#374151",
                                    lineHeight: "1.5",
                                }}
                            >
                                {translatedMessage}
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
                            📥 {t("downloadAckReceipt")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Ack;
