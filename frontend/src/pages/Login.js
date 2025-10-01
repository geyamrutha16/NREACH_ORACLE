import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bg from "./BACKGROUND.png";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await axios.post("https://nreach-data.onrender.com/api/login", {
                username,
                password,
            });

            if (res.data.success) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("role", res.data.role);
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
            {/* Internal styles for responsiveness */}
            <style>
                {`
          .login-container {
            height: 100vh;
            display: flex;
            justify-content: flex-end; /* Default right aligned */
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

          .logo-container img {
            width: 90%;
            height: 100px;
            object-fit: cover;
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
              justify-content: center; /* Center on mobile */
              padding-right: 0;
              padding: 20px;
            }
        `}
            </style>

            <div className="login-box">
                <div className="logo-container">
                    <img
                        src="https://th.bing.com/th/id/R.99f5013bf6aa4aea7096f521010231d6?rik=qJ2wQR794YxEFw&riu=http%3a%2f%2fwww.necg.ac.in%2fimages%2flogo-new.png&ehk=34uOcsZyguHwG4u8oCBwaFUQ4AA6SlHmamc2ZTqFLrU%3d&risl=&pid=ImgRaw&r=0"
                        alt="Narayana Engineering College"
                    />
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
