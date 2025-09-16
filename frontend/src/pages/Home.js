import React, { useState, useEffect } from "react";
import SmsTable from "./SmsTable";
import UploadExcel from "./UploadExcel";

const Home = () => {
    const [refresh, setRefresh] = useState(false);
    const [activeTab, setActiveTab] = useState(""); // "" | upload | dashboard
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check screen size on mount and resize
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Navigation items
    const navItems = [
        { id: "", label: "Home", icon: "🏠" },
        { id: "upload", label: "Upload", icon: "⬆️" },
        { id: "dashboard", label: "Dashboard", icon: "📊" }
    ];

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #3B82F6, #6366F1)",
                color: "#fff",
                padding: "20px",
                position: "relative"
            }}
        >
            {/* Desktop Navigation (Top Right) */}
            {!isMobile && (
                <div style={{
                    position: "fixed",
                    top: "20px",
                    right: "20px",
                    display: "flex",
                    gap: "10px",
                    zIndex: 1001
                }}>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                padding: "8px 10px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer",
                                background: activeTab === item.id ? "#10B981" : "rgba(255,255,255,0.2)",
                                color: "#fff",
                                fontWeight: "600",
                                fontSize: "13px",
                                transition: "all 0.3s ease",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                backdropFilter: "blur(10px)",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                            }}
                        >
                            <span style={{ fontSize: "16px" }}>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Mobile Hamburger Menu Button */}
            {isMobile && (
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{
                        position: "fixed",
                        top: "20px",
                        right: "20px",
                        background: "rgba(255,255,255,0.2)",
                        border: "none",
                        color: "#fff",
                        fontSize: "24px",
                        cursor: "pointer",
                        padding: "10px 15px",
                        borderRadius: "8px",
                        zIndex: 1001,
                        backdropFilter: "blur(10px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                    }}
                >
                    {isMobileMenuOpen ? "✕" : "☰"}
                </button>
            )}

            {/* Mobile Navigation Menu */}
            {isMobile && isMobileMenuOpen && (
                <div style={{
                    position: "fixed",
                    top: "0",
                    right: "0",
                    bottom: "0",
                    width: "250px",
                    background: "rgba(30, 58, 138, 0.98)",
                    zIndex: 1000,
                    padding: "80px 20px 20px 20px",
                    boxShadow: "0 0 20px rgba(0,0,0,0.3)",
                    backdropFilter: "blur(10px)"
                }}>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                    }}>
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setIsMobileMenuOpen(false);
                                }}
                                style={{
                                    padding: "15px 20px",
                                    borderRadius: "8px",
                                    border: "none",
                                    cursor: "pointer",
                                    background: activeTab === item.id ? "#10B981" : "rgba(255,255,255,0.1)",
                                    color: "#fff",
                                    fontWeight: "600",
                                    fontSize: "16px",
                                    transition: "all 0.3s ease",
                                    textAlign: "left",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px"
                                }}
                            >
                                <span style={{ fontSize: "20px" }}>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div style={{
                textAlign: "center",
                padding: "20px",
                margin: "20px auto"
            }}>
                {activeTab === "" && (
                    <div style={{
                        marginTop: isMobile ? "100px" : "150px",
                        padding: "40px 20px",
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: "20px",
                        backdropFilter: "blur(10px)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
                    }}>
                        <h1 style={{
                            fontSize: "3rem",
                            marginBottom: "20px",
                            fontWeight: "bold"
                        }}>
                            Welcome to<br />SMS System
                        </h1>
                        <p style={{
                            fontSize: "1.3rem",
                            opacity: 0.9,
                            lineHeight: "1.6"
                        }}>
                            Manage and send bulk SMS messages efficiently
                        </p>
                    </div>
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

            {/* Overlay when menu is open */}
            {isMobile && isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.5)",
                        zIndex: 999,
                        cursor: "pointer"
                    }}
                />
            )}

            {/* Responsive CSS */}
            <style>
                {`
                @media (max-width: 768px) {
                    .welcome-container {
                        margin-top: 50px !important;
                        padding: 20px !important;
                    }
                    
                    .welcome-title {
                        font-size: 2rem !important;
                    }
                    
                    .welcome-text {
                        font-size: 1.1rem !important;
                    }
                }
                
                button {
                    transition: all 0.3s ease;
                }
                
                button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
                `}
            </style>
        </div>
    );
};

export default Home;
/*
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
        </div >
    );
};

export default Home;
*/
