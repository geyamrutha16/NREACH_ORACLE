import React, { useRef } from "react";
import PRINCIPAL_SIGN from "./PRINCIPAL_SIGN.png";
import HOD_SIGN from "./HOD_SIGN.png";

const AcknowledgementReceipt = ({ sms, onClose }) => {
    const receiptRef = useRef();

    // Print/Download as PDF
    const handleDownload = () => {
        const printContent = receiptRef.current;
        const printWindow = window.open("", "", "width=800,height=600");
        printWindow.document.write(`
      <html>
        <head>
          <title>Acknowledgement Receipt</title>
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
        <div className="fixed inset-0 flex items-center justify-center z-50">

            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            ></div>


            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl p-6 z-10">

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                    ×
                </button>

                <h1 className="text-2xl font-bold text-center text-blue-700">
                    📜 Acknowledgement Receipt
                </h1>


                <div
                    ref={receiptRef}
                    className="bg-white p-6 mt-4 rounded-lg border border-gray-200"
                >
                    <p className="text-lg text-gray-800 mb-4">
                        <strong>Roll No:</strong> {sms.rollNo || "N/A"} <br />
                        <strong>Attendance:</strong> {sms.attendance || "N/A"}% <br />
                        <strong>Mobile No:</strong> {sms.phoneNumber} <br />
                        <strong>Date:</strong>{" "}
                        {new Date(sms.createdAt).toLocaleDateString()} <br />
                        <strong>Time:</strong>{" "}
                        {new Date(sms.createdAt).toLocaleTimeString()}
                    </p>


                    <div className="flex justify-between mt-10">
                        <div className="text-center">
                            <img
                                src={HOD_SIGN}
                                alt="HOD Signature"
                                className="h-16 mx-auto"
                            />
                            <p className="mt-2 text-gray-700 font-medium">HOD</p>
                        </div>

                        <div className="text-center">
                            <img
                                src={PRINCIPAL_SIGN}
                                alt="Principal Signature"
                                className="h-16 mx-auto"
                            />
                            <p className="mt-2 text-gray-700 font-medium">Principal</p>
                        </div>
                    </div>

                </div>


                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleDownload}
                        className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition"
                    >
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AcknowledgementReceipt;