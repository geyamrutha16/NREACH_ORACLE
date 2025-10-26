import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bg from "./BACKGROUND.png";
import loginheader from "./login_header.png";
import loginheaderhome from "./login_header_mobile.png";

function Login() {
    const [role, setRole] = useState("operator"); // "operator" or "student"
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const navigate = useNavigate();

    // Update isMobile on resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Operator/HOD login
    const handleOperatorLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await axios.post("http://localhost:5000/api/login", {
                username: username.trim(),
                password: password.trim(),
            });

            if (res.data.success) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("role", res.data.user.role);
                navigate("/home");
            } else {
                setError("Invalid username or password");
            }
        } catch (err) {
            setError("Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    // Student OTP flow
    const sendOtp = async () => {
        if (!mobile) return setError("Enter mobile number");
        setLoading(true);
        setError("");

        try {
            const res = await axios.post("http://localhost:5000/api/send-otp", {
                mobile: `+91${mobile.trim()}`,
            });
            if (res.data.success) {
                setOtpSent(true);
            } else {
                setError("Failed to send OTP");
            }
        } catch (err) {
            setError("Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (!otp) return setError("Enter OTP");
        setLoading(true);
        setError("");

        try {
            const res = await axios.post("http://localhost:5000/api/verify-otp", {
                mobile: `+91${mobile.trim()}`,
                otp,
            });

            if (res.data.success) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("role", "student");
                console.log(mobile);
                sessionStorage.setItem("studentPhone", mobile.trim());
                navigate("/student-home", { state: { mobile: mobile.trim() } });
            } else {
                setError("Invalid OTP");
            }
        } catch (err) {
            setError("Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container" style={{ backgroundImage: `url(${bg})` }}>
            <style>{`
        .login-container {
          height: 100vh;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          background-size: cover;
          background-position: center;
          padding-right: 60px;
        }
        .login-box {
          width: 350px;
          padding: 40px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          text-align: center;
        }
        .login-title {
          margin-bottom: 20px;
          color: #333;
        }
        .role-toggle {
          margin-bottom: 20px;
        }
        .role-toggle button {
          margin: 0 5px;
          padding: 8px 12px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          background: #667eea;
          color: #fff;
        }
        .role-toggle button.active {
          background: #16a34a;
        }
        .error-text { color: red; margin-bottom: 10px; }
        .login-form input {
          width: 90%;
          padding: 12px;
          margin-bottom: 15px;
          border-radius: 8px;
          border: 1px solid #ccc;
        }
        .login-form button {
          width: 95%;
          padding: 12px;
          background: #667eea;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: 0.3s ease;
        }
        .login-form button:disabled { background: #999; cursor: not-allowed; }
        @media (max-width: 768px) {
          .login-container {
            justify-content: center;
            padding-right: 0;
            padding: 20px;
          }
        }
      `}</style>

            <div className="login-box">
                <div className="logo-container">
                    {isMobile ? (
                        <img src={loginheaderhome} alt="Narayana Engineering College Mobile" />
                    ) : (
                        <img src={loginheader} alt="Narayana Engineering College Desktop" />
                    )}
                </div>

                <h1 className="login-title">NReach</h1>

                {/* Role Toggle */}
                <div className="role-toggle">
                    <button
                        className={role === "operator" ? "active" : ""}
                        onClick={() => setRole("operator")}
                    >
                        Operator/HOD
                    </button>
                    <button
                        className={role === "student" ? "active" : ""}
                        onClick={() => setRole("student")}
                    >
                        Student
                    </button>
                </div>

                {error && <p className="error-text">{error}</p>}

                {role === "operator" ? (
                    <form onSubmit={handleOperatorLogin} className="login-form">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? "Processing..." : "Login"}
                        </button>
                    </form>
                ) : (
                    <div className="login-form">
                        {!otpSent ? (
                            <>
                                <input
                                    type="text"
                                    placeholder="Mobile Number"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    disabled={loading}
                                />
                                <button onClick={sendOtp} disabled={loading}>
                                    {loading ? "Sending OTP..." : "Send OTP"}
                                </button>
                            </>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    disabled={loading}
                                />
                                <button onClick={verifyOtp} disabled={loading}>
                                    {loading ? "Verifying..." : "Verify OTP"}
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Login;


/*
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bg from "./BACKGROUND.png";
import loginheader from "./login_header.png";
import loginheaderhome from "./login_header_mobile.png";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const navigate = useNavigate();

    // ✅ Update isMobile when screen resizes
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            console.log("username:", username);
            console.log("password:", password);
            //const res = await axios.post("https://nreach-data.onrender.com/api/login", {
            const res = await axios.post("http://localhost:5000/api/login", {
                username: username.trim(),
                password: password.trim(),
            });

            if (res.data.success) {
                console.log("Login response:", res.data);
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("role", res.data.user.role);
                navigate("/home");
            } else {
                setError("Invalid username or password");
            }
        } catch (err) {
            setError("Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="login-container"
            style={{ backgroundImage: `url(${bg})` }}
        >
            <style>
                {`
          .login-container {
            height: 100vh;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            background-size: cover;
            background-position: center;
            padding-right: 60px;
          }

          .login-box {
            width: 350px;
            padding: 40px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            text-align: center;
          }

          .login-title {
            margin-bottom: 30px;
            color: #333;
          }

          .error-text {
            color: red;
          }

          .login-form input {
            width: 90%;
            padding: 12px;
            margin-bottom: 15px;
            border-radius: 8px;
            border: 1px solid #ccc;
          }

          .login-form button {
            width: 95%;
            padding: 12px;
            background: #667eea;
            color: #fff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: 0.3s ease;
          }

          .login-form button:disabled {
            background: #999;
            cursor: not-allowed;
          }

@media(max - width: 768px) {
            .login - container {
        justify - content: center;
        padding - right: 0;
        padding: 20px;
    }
}
`}
            </style>

            <div className="login-box">
                <div className="logo-container">
                    {isMobile ? (
                        <img
                            src={loginheaderhome}
                            alt="Narayana Engineering College Mobile"
                        />
                    ) : (
                        <img
                            src={loginheader}
                            alt="Narayana Engineering College Desktop"
                        />
                    )}
                </div>

                <h1 className="login-title">NReach</h1>

                {error && <p className="error-text">{error}</p>}

                <form onSubmit={handleLogin} className="login-form">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Processing..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
*/
