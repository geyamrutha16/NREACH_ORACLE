import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Volume2 } from "lucide-react";

// Remove emojis
const removeEmojis = (str) =>
    str.replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|\u24C2|\u25A0-\u25FF|\u2600-\u26FF)/g,
        ""
    );

// Map i18n language codes to voices
const langMap = {
    en: "en-IN",
    te: "te-IN",
    hi: "hi-IN",
    ta: "ta-IN",
    kn: "kn-IN",
};

const VoiceAgent = () => {
    const { i18n } = useTranslation();
    const [speaking, setSpeaking] = useState(false);
    const [voices, setVoices] = useState([]);
    const [currentLang, setCurrentLang] = useState(langMap[i18n.language] || "en-IN");

    // Update voice list when browser loads them
    useEffect(() => {
        const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    // 🔄 Watch for i18n language changes
    useEffect(() => {
        setCurrentLang(langMap[i18n.language] || "en-IN");
    }, [i18n.language]);

    const handleSpeak = () => {
        let text = document.body.innerText;
        if (!text) return;

        text = removeEmojis(text);

        if (speaking) {
            window.speechSynthesis.cancel();
            setSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Find matching voice
        const voice = voices.find((v) => v.lang === currentLang);
        if (voice) {
            utterance.voice = voice;
        } else {
            utterance.lang = currentLang; // fallback
        }

        utterance.rate = 1;
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
