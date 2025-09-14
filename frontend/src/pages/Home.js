import React, { useState } from "react";
import SmsTable from "./SmsTable";
import UploadExcel from "./UploadExcel";

const Home = () => {
    const [refresh, setRefresh] = useState(false);
    const [activeTab, setActiveTab] = useState(""); // "" | upload | dashboard

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #3B82F6, #6366F1)",
                color: "#fff",
                padding: "20px",
                textAlign: "center",
            }}
        >
            {/* Top Buttons */}
            <div style={{ marginBottom: "30px" }}>
                <button
                    onClick={() => setActiveTab("")}
                    style={{
                        margin: "10px",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        background: activeTab === "" ? "#10B981" : "#1E3A8A",
                        color: "#fff",
                        fontWeight: "600",
                    }}
                >
                    🏠 Home
                </button>

                <button
                    onClick={() => setActiveTab("upload")}
                    style={{
                        margin: "10px",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        background: activeTab === "upload" ? "#10B981" : "#1E3A8A",
                        color: "#fff",
                        fontWeight: "600",
                    }}
                >
                    ⬆️ Upload
                </button>

                <button
                    onClick={() => setActiveTab("dashboard")}
                    style={{
                        margin: "10px",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        background: activeTab === "dashboard" ? "#10B981" : "#1E3A8A",
                        color: "#fff",
                        fontWeight: "600",
                    }}
                >
                    📊 Dashboard
                </button>
            </div>

            {/* Content */}
            <div>
                {activeTab === "" && (
                    <h1 style={{ fontSize: "2.5rem", marginTop: "100px" }}>👋 Welcome</h1>
                )}

                {activeTab === "upload" && <UploadExcel setRefresh={setRefresh} />}

                {activeTab === "dashboard" && (
                    <div
                        style={{
                            background: "#fff",
                            color: "#000",
                            padding: "20px",
                            borderRadius: "12px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                            marginTop: "20px",
                        }}
                    >
                        <SmsTable refresh={refresh} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
