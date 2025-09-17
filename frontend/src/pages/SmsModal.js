import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import watermarkLogo from "./logo.png"; // Replace with your logo
import PRINCIPAL_SIGN from "./PRINCIPAL_SIGN.png";
import HOD_SIGN from "./HOD_SIGN.png";

const SmsModal = ({ sms, onClose }) => {
    const receiptRef = useRef();

    const handleDownload = () => {
        if (!receiptRef.current) return;

        const opt = {
            margin: [0.5, 0.5], // top/bottom, left/right
            filename: `${sms?.name || "receipt"}_acknowledgment.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        };

        html2pdf().set(opt).from(receiptRef.current).save();
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
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button (Not in PDF) */}
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
                    }}
                >
                    ×
                </button>

                {/* Content that goes to PDF */}
                <div ref={receiptRef} style={{ position: "relative", zIndex: 1 }}>
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
                        }}
                    />

                    <h2
                        style={{
                            marginBottom: "15px",
                            fontSize: "28px",
                            color: "#057aff",
                            textAlign: "center",   // ✅ Center heading
                        }}
                    >
                        Acknowledgement Receipt
                    </h2>


                    <hr style={{ marginBottom: "25px", borderColor: "#ddd" }} />

                    <div style={{ lineHeight: "1.8", textAlign: "left", marginBottom: "40px" }}>
                        <p>
                            This is to acknowledge that your ward{" "}
                            <strong>{sms?.name}</strong> with RollNo{" "}
                            <strong>{sms?.rollNo}</strong> attendance report has been successfully sent
                            to the mobile number <strong>{sms?.phoneNumber}</strong> on{" "}
                            <strong>
                                {sms?.createdAt ? new Date(sms.createdAt).toLocaleString() : "N/A"}
                            </strong>.
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
                        {/*
                        <div style={{ textAlign: "center" }}>
                            <p>____________________</p>
                            <p>HOD</p>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <p>____________________</p>
                            <p>Principal</p>
                        </div>
                        */}
                        <div className="text-center">
                            <img
                                src={HOD_SIGN}
                                alt="HOD Signature"
                                className="h-16 mx-auto"
                                width="80px"
                                height="50px"
                            />
                            <p className="mt-2 text-gray-700 font-medium">HOD</p>
                        </div>

                        <div className="text-center">
                            <img
                                src={PRINCIPAL_SIGN}
                                alt="Principal Signature"
                                className="h-16 mx-auto"
                                width="80px"
                                height="50px"
                            />
                            <p className="mt-2 text-gray-700 font-medium">Principal</p>
                        </div>
                    </div>
                </div>

                {/* Buttons (Not in PDF) */}
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

                </div>
            </div>
        </div>
    );
};

export default SmsModal;
