import React, { useState, useEffect } from "react";
import SmsTable from "./SmsTable";
import UploadExcel from "./UploadExcel";
import icon from './logo.png';
import axios from "axios";
import background from './BACKGROUND.png';

const Home = () => {
    const [refresh, setRefresh] = useState(false);
    const [activeTab, setActiveTab] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [role, setRole] = useState("");
    const [logoutLoading, setLogoutLoading] = useState(false);

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        setRole(storedRole || "");
        console.log(localStorage.getItem("role"));
    }, []);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const navItems = [
        { id: "", label: "Home", icon: "🏠" },
        ...(role === "operator" ? [{ id: "upload", label: "Upload", icon: "⬆️" }] : []),
        { id: "dashboard", label: "TrackBoard", icon: "📊" }
    ];

    const handleLogout = async () => {
        setLogoutLoading(true);
        try {
            await axios.post("https://nreach-data.onrender.com/api/logout", {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
        } catch (err) {
            console.error("Logout API failed");
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/";
            setLogoutLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                //background: "linear-gradient(135deg, #2164a4, rgb(44 47 165))",
                backgroundImage: `url(${background})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "repeat-y",
                color: "#fff",
                padding: "20px",
                position: "relative",
                fontFamily: "Arial, sans-serif"
            }}
        >
            {!isMobile && (
                <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginBottom: "30px"
                }}>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                padding: "10px 20px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer",
                                background: activeTab === item.id ? "#10B981" : "#002147",
                                color: "#fff",
                                fontWeight: "600",
                                fontSize: "14px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                backdropFilter: "blur(10px)",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                transition: "all 0.3s ease"
                            }}
                        >
                            <span style={{ fontSize: "16px" }}>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}

                    <button
                        onClick={handleLogout}
                        disabled={logoutLoading}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "8px",
                            border: "none",
                            cursor: logoutLoading ? "not-allowed" : "pointer",
                            background: logoutLoading ? "#999" : "#EF4444",
                            color: "#fff",
                            fontWeight: "600",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                            transition: "all 0.3s ease"
                        }}
                    >
                        {logoutLoading ? "Logging out..." : "🔒 Logout"}
                    </button>
                </div>
            )}

            {
                isMobile && (
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
                )
            }

            {
                isMobile && isMobileMenuOpen && (
                    <div style={{
                        position: "fixed",
                        top: "0",
                        right: "0",
                        bottom: "0",
                        width: "250px",
                        background: "#0194d8",
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
                                        background: activeTab === item.id ? "#10B981" : "#002147",
                                        color: "#fff",
                                        fontWeight: "600",
                                        fontSize: "16px",
                                        textAlign: "left",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        transition: "all 0.3s ease"
                                    }}
                                >
                                    <span style={{ fontSize: "20px" }}>{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}

                            <button
                                onClick={handleLogout}
                                disabled={logoutLoading}
                                style={{
                                    padding: "15px 20px",
                                    borderRadius: "8px",
                                    border: "none",
                                    cursor: logoutLoading ? "not-allowed" : "pointer",
                                    background: logoutLoading ? "#999" : "#EF4444",
                                    color: "#fff",
                                    fontWeight: "600",
                                    fontSize: "16px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                {logoutLoading ? "Logging out..." : "🔒 Logout"}
                            </button>
                        </div>
                    </div>
                )
            }

            <div style={{
                textAlign: "center",
                padding: "20px",
                margin: "20px auto",
                maxWidth: "1200px"
            }}>
                {activeTab === "" && (
                    <div style={{
                        marginTop: isMobile ? "60px" : "30px",
                        padding: "30px",
                        background: "#002147",
                        borderRadius: "20px",
                        backdropFilter: "blur(10px)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: "center",
                        gap: "20px"
                    }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            flex: "0 0 auto",
                            backgroundColor: "#002147",

                        }}>
                            <div style={{
                                width: isMobile ? "120px" : "180px",
                                height: isMobile ? "120px" : "180px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden"
                            }}>
                                <img
                                    src={icon}
                                    alt="SMS Campaign Manager"
                                    style={{
                                        width: isMobile ? "100px" : "180px",
                                        height: isMobile ? "100px" : "180px"
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{
                            textAlign: isMobile ? "center" : "left",
                            flex: "1"
                        }}>
                            <h1 style={{
                                fontSize: isMobile ? "2rem" : "2.8rem",
                                marginBottom: "15px",
                                fontWeight: "bold",
                                background: "linear-gradient(45deg, #fff, #e0e7ff)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent"
                            }}>
                                NREACH
                            </h1>
                            <p style={{
                                fontSize: isMobile ? "1rem" : "1.2rem",
                                opacity: 0.9,
                                lineHeight: "1.6",
                                marginBottom: "25px"
                            }}>
                                Attendance Messaging System: Effortlessly manage and send attendance reports to Parents.
                                Upload the list, and track SMS status at one place.
                            </p>
                            {role === "operator" && (
                                <button
                                    onClick={() => setActiveTab("upload")}
                                    style={{
                                        padding: "12px 25px",
                                        borderRadius: "8px",
                                        border: "none",
                                        cursor: "pointer",
                                        background: "linear-gradient(45deg, #10B981, #059669)",
                                        color: "#fff",
                                        fontWeight: "600",
                                        fontSize: isMobile ? "1rem" : "1.1rem",
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                                    }}
                                >
                                    Get Started Now
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "upload" && <UploadExcel setRefresh={setRefresh} />}

                {activeTab === "dashboard" && (
                    <div style={{
                        background: "#fff",
                        color: "#000",
                        padding: "20px",
                        borderRadius: "12px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        marginTop: "20px",
                        overflowX: "auto"
                    }}>
                        <SmsTable refresh={refresh} />
                    </div>
                )}
            </div>

            {
                isMobile && isMobileMenuOpen && (
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
                )
            }

            <style>
                {`
                @media (max-width: 768px) {
                    button {
                        font-size: 1rem !important;
                    }
                }
                button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
                `}
            </style>
        </div >
    );
};

export default Home;
