import React, { useState, useEffect } from "react";
import SmsTable from "./SmsTable";
import axios from "axios";
import background from './BACKGROUND.png';
import { useLocation } from "react-router-dom";
import StudentAttendanceDisplay from "./StudentAttendanceDisplay";

const StudentDashboard = () => {
    const location = useLocation();
    const phone = location.state?.mobile; // ✅ Get phone from navigation state
    console.log("Student Dashboard Phone:", phone);
    const [refresh, setRefresh] = useState(false);
    const [activeTab, setActiveTab] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [role, setRole] = useState("");
    const [logoutLoading, setLogoutLoading] = useState(false);

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        setRole(storedRole || "");
    }, []);

    useEffect(() => {
        const checkScreenSize = () => setIsMobile(window.innerWidth <= 768);
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const navItems = [
        { id: "", label: "TrackBoard", icon: "📊" }
    ];

    const handleLogout = async () => {
        setLogoutLoading(true);
        try {
            await axios.post("http://localhost:5000/api/logout", {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
        } catch (err) {
            console.error("Logout API failed");
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("studentToken");
            window.location.href = "/";
            setLogoutLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
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
            {/* Desktop Navigation */}
            {!isMobile && (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "30px" }}>
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

            {/* Mobile Menu Button */}
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

            {/* Mobile Sidebar */}
            {isMobile && isMobileMenuOpen && (
                <>
                    <div
                        style={{
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
                        }}
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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

                    {/* Overlay */}
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
                </>
            )}

            {activeTab === "" && (
                <div
                    style={{
                        background: "#fff",
                        color: "#000",
                        padding: "20px",
                        borderRadius: "12px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        marginTop: "20px",
                        overflowX: "auto"
                    }}
                >
                    <StudentAttendanceDisplay refresh={refresh} phone={phone} />
                </div>
            )}

            {/* Global styles */}
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
        </div>
    );
};

export default StudentDashboard;
