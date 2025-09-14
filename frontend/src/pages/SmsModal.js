import React from "react";
import watermarkLogo from "./logo.png"; // Replace with your logo path

const SmsModal = ({ sms, onClose }) => {
    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob(
            [
                `Name: ${sms.name}\nRollNo: ${sms.rollNo}\nPhone: ${sms.phoneNumber}\nYear: ${sms.year}\nStatus: ${sms.status ? "Yes" : "No"
                }\nSent At: ${new Date(sms.createdAt).toLocaleString()}\nAcknowledged: ${sms.seen ? "Yes" : "No"
                }`,
            ],
            { type: "text/plain" }
        );
        element.href = URL.createObjectURL(file);
        element.download = `${sms.name}_acknowledgment.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "15px",
            }}
            onClick={onClose}
        >
            <div
                style={{
                    position: "relative",
                    background: "#ffffff",
                    padding: "30px 35px",
                    borderRadius: "12px",
                    minWidth: "360px",
                    maxWidth: "520px",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
                    fontFamily: "Arial, sans-serif",
                    color: "#333",
                    overflow: "hidden",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Watermark */}
                <img
                    src={watermarkLogo}
                    alt="watermark"
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "200px",
                        height: "200px",
                        opacity: 0.1,
                        filter: "blur(1px)",
                        pointerEvents: "none",
                        zIndex: 0,
                    }}
                />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "15px",
                        right: "15px",
                        background: "transparent",
                        border: "none",
                        fontSize: "22px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        color: "#888",
                        zIndex: 1,
                    }}
                >
                    ×
                </button>

                {/* Modal Content */}
                <div style={{ position: "relative", zIndex: 1 }}>
                    <h2 style={{ marginBottom: "15px", fontSize: "33px", color: "#057aff" }}>Acknowledgement Receipt</h2>

                    <hr style={{ marginBottom: "25px", borderColor: "#ddd" }} />

                    <div style={{ lineHeight: "2", textAlign: "left", marginBottom: "40px" }}>
                        <p>
                            This is to acknowledge that your ward{" "}
                            <span style={{ fontWeight: "bold" }}>{sms.name}</span> with RollNo{" "}
                            <span style={{ fontWeight: "bold" }}>{sms.rollNo}</span> attendance report has been successfully sent
                            to the mobile number <span style={{ fontWeight: "bold" }}>{sms.phoneNumber}</span> on{" "}
                            <span style={{ fontWeight: "bold" }}>{new Date(sms.createdAt).toLocaleString()}</span>.
                        </p>
                    </div>

                    {/* Signatures */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "50px",
                            paddingTop: "20px",
                        }}
                    >
                        <div style={{ textAlign: "center" }}>
                            <p>____________________</p>
                            <p>HOD</p>
                        </div>

                        <div style={{ textAlign: "center" }}>
                            <p>____________________</p>
                            <p>Principal</p>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "15px", marginTop: "30px" }}>
                        <button
                            onClick={handleDownload}
                            style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                border: "none",
                                backgroundColor: "#4CAF50",
                                color: "#fff",
                                cursor: "pointer",
                                fontWeight: "bold",
                            }}
                        >
                            Download Ack
                        </button>

                        <button
                            onClick={onClose}
                            style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                border: "none",
                                backgroundColor: "#f44336",
                                color: "#fff",
                                cursor: "pointer",
                                fontWeight: "bold",
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmsModal;
