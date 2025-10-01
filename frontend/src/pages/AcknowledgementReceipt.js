import React, { useRef } from "react";
import PRINCIPAL_SIGN from "./PRINCIPAL_SIGN.png";
import HOD_SIGN from "./HOD_SIGN.png";

const AcknowledgementReceipt = ({ sms, onClose }) => {
    const receiptRef = useRef();

    const handleDownload = () => {
        const printContent = receiptRef.current;
        const printWindow = window.open("", "", "width=800,height=600");
        printWindow.document.write(`
      <html>
        <head>
          <title>Acknowledgement Receipt from NReach</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #1e3a8a; }
            p { font-size: 16px; margin: 5px 0; }
            .signature-section {
              display: flex; justify-content: space-between; margin-top: 50px;
            }
            .signature { text-align: center; }
            .line { border-top: 2px solid #000; width: 150px; margin: auto; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="receipt-overlay">
            <div className="receipt-backdrop" onClick={onClose}></div>

            <div className="receipt-container">
                <button
                    onClick={onClose}
                    className="receipt-close-btn"
                >
                    ×
                </button>

                <h1 className="receipt-heading">
                    📜 Acknowledgement Receipt
                </h1>

                <div
                    ref={receiptRef}
                    className="receipt-content"
                >
                    <div className="receipt-details">
                        <div className="detail-item">
                            <strong>Roll No:</strong> {sms.rollNo || "N/A"}
                        </div>
                        <div className="detail-item">
                            <strong>Attendance:</strong> {sms.attendance || "N/A"}%
                        </div>
                        <div className="detail-item">
                            <strong>Mobile No:</strong> {sms.phoneNumber}
                        </div>
                        <div className="detail-item">
                            <strong>Date:</strong> {new Date(sms.createdAt).toLocaleDateString()}
                        </div>
                        <div className="detail-item">
                            <strong>Time:</strong> {new Date(sms.createdAt).toLocaleTimeString()}
                        </div>
                    </div>

                    <div className="signatures-section">
                        <div className="signature-item">
                            <img
                                src={HOD_SIGN}
                                alt="HOD Signature"
                                className="signature-image"
                            />
                            <p className="signature-label">HOD</p>
                        </div>

                        <div className="signature-item">
                            <img
                                src={PRINCIPAL_SIGN}
                                alt="Principal Signature"
                                className="signature-image"
                            />
                            <p className="signature-label">Principal</p>
                        </div>
                    </div>
                </div>

                <div className="download-section">
                    <button
                        onClick={handleDownload}
                        className="download-btn"
                    >
                        Download PDF
                    </button>
                </div>
            </div>

            <style jsx>{`
                .receipt-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 50;
                    padding: 16px;
                }

                .receipt-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                }

                .receipt-container {
                    position: relative;
                    width: 100%;
                    max-width: 600px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    padding: 24px;
                    z-index: 10;
                    margin: 0 auto;
                }

                .receipt-close-btn {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    color: #6b7280;
                    font-size: 24px;
                    font-weight: bold;
                    background: white;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    border: none;
                    cursor: pointer;
                }

                .receipt-close-btn:hover {
                    color: #374151;
                }

                .receipt-heading {
                    font-size: 24px;
                    font-weight: bold;
                    text-align: center;
                    color: #1e3a8a;
                    margin-bottom: 16px;
                    word-wrap: break-word;
                    padding: 0 8px;
                }

                .receipt-content {
                    background: white;
                    padding: 16px;
                    margin-top: 16px;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                }

                .receipt-details {
                    margin-bottom: 16px;
                }

                .detail-item {
                    font-size: 16px;
                    margin-bottom: 8px;
                    color: #374151;
                }

                .signatures-section {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    margin-top: 32px;
                    gap: 24px;
                }

                .signature-item {
                    text-align: center;
                }

                .signature-image {
                    height: 64px;
                    margin: 0 auto;
                }

                .signature-label {
                    margin-top: 8px;
                    color: #374151;
                    font-weight: 500;
                }

                .download-section {
                    margin-top: 24px;
                    display: flex;
                    justify-content: center;
                }

                .download-btn {
                    padding: 12px 20px;
                    background-color: #16a34a;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    font-size: 16px;
                    width: 100%;
                    max-width: 200px;
                }

                .download-btn:hover {
                    background-color: #15803d;
                }

                /* Tablet and larger screens */
                @media (min-width: 640px) {
                    .receipt-container {
                        padding: 24px;
                    }

                    .receipt-close-btn {
                        top: 16px;
                        right: 16px;
                    }

                    .receipt-heading {
                        font-size: 28px;
                    }

                    .receipt-content {
                        padding: 24px;
                    }

                    .signatures-section {
                        flex-direction: row;
                        gap: 0;
                    }

                    .signature-image {
                        height: 80px;
                    }

                    .download-btn {
                        width: auto;
                    }
                }

                /* Desktop screens */
                @media (min-width: 1024px) {
                    .receipt-heading {
                        font-size: 32px;
                    }

                    .detail-item {
                        font-size: 18px;
                    }
                }
            `}</style>
        </div>
    );
};

export default AcknowledgementReceipt;