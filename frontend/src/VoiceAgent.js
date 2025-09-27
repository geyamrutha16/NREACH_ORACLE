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

const VoiceAgent = ({ targetRef }) => {
    const { i18n } = useTranslation();
    const [speaking, setSpeaking] = useState(false);
    const [voices, setVoices] = useState([]);
    const [currentLang, setCurrentLang] = useState(langMap[i18n.language] || "en-IN");

    useEffect(() => {
        const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    useEffect(() => {
        setCurrentLang(langMap[i18n.language] || "en-IN");
    }, [i18n.language]);

    const handleSpeak = () => {
        // 🔹 Only read from provided ref instead of whole document
        let text = targetRef?.current?.innerText || "";
        if (!text) return;

        text = removeEmojis(text);

        if (speaking) {
            window.speechSynthesis.cancel();
            setSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);

        const voice = voices.find((v) => v.lang === currentLang);
        if (voice) utterance.voice = voice;
        else utterance.lang = currentLang;

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
                top: "5px",
                right: "10px",
                width: "40px",       // 🔹 fixed width
                height: "40px",      // 🔹 fixed height
                background: speaking ? "#27ba74" : "#ff5945",
                color: "#fff",
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                display: "flex",     // center the icon
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
        >
            <Volume2 size={28} />
        </button>
    );
};

export default VoiceAgent;
