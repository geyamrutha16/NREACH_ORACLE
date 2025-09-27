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
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                paddingRight: "60px",
            }}
        >
            <div
                style={{
                    width: "350px",
                    padding: "40px",
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                    textAlign: "center",
                }}
            >
                <div style={{ width: "100%", background: "#fff" }}>
                    <img
                        src="https://th.bing.com/th/id/R.99f5013bf6aa4aea7096f521010231d6?rik=qJ2wQR794YxEFw&riu=http%3a%2f%2fwww.necg.ac.in%2fimages%2flogo-new.png&ehk=34uOcsZyguHwG4u8oCBwaFUQ4AA6SlHmamc2ZTqFLrU%3d&risl=&pid=ImgRaw&r=0"
                        alt="Narayana Engineering College"
                        style={{ width: "90%", height: "100px", objectFit: "cover" }}
                    />
                </div>

                <h1 style={{ marginBottom: "30px", color: "#333" }}>NReach</h1>

                {error && <p style={{ color: "red" }}>{error}</p>}

                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                            width: "90%",
                            padding: "12px",
                            marginBottom: "15px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                        }}
                        disabled={loading}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: "90%",
                            padding: "12px",
                            marginBottom: "10px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                        }}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "95%",
                            padding: "12px",
                            background: loading ? "#999" : "#667eea",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontWeight: "bold",
                        }}
                    >
                        {loading ? "Processing..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
