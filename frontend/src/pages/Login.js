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

          /* ✅ Mobile view override */
          @media (max-width: 768px) {
            .login-container {
              justify-content: center;
              padding-right: 0;
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
