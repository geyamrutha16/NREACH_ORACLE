import React, { useState } from "react";
import { Volume2 } from "lucide-react"; // mic/speaker icon (lucide)

const VoiceAgent = () => {
    const [speaking, setSpeaking] = useState(false);

    const handleSpeak = () => {
        const text = document.body.innerText; // Read entire screen content
        if (!text) return;

        if (speaking) {
            window.speechSynthesis.cancel(); // stop current speech
            setSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-IN"; // you can change to "hi-IN" for Hindi, "te-IN" for Telugu, etc.
        utterance.rate = 1; // normal speed
        utterance.pitch = 1;

        utterance.onend = () => setSpeaking(false);

        setSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    return (
        <button
            onClick={handleSpeak}
            style={{
                position: "fixed",
                top: "10px",
                right: "10px",
                background: speaking ? "#DC2626" : "#3B82F6",
                color: "#fff",
                padding: "0.75rem",
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
        >
            <Volume2 size={24} />
        </button>
    );
};

export default VoiceAgent;
