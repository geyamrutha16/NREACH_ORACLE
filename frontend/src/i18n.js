import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
    en: {
        translation: {
            college: "Narayana Engineering College, Gudur",
            dept: "Dept. of CSE",
            alert: "NReach Attendance Alert",
            message:
                "Your ward {{name}} with Roll No: {{rollNo}} of {{year}} Year, CSE-{{section}} is having attendance of {{attendance}}% from {{fromDate}} to {{toDate}}.",
            contact: "For further details, kindly contact HOD/Principal.",
            phone: "Ph: +91 81219 79628",
        },
    },
    te: {
        translation: {
            college: "నారాయణ ఇంజినీరింగ్ కళాశాల, గూడూరు",
            dept: "సిఎస్‌ఇ విభాగం",
            alert: "ఎన్‌రీచ్ హాజరు అలర్ట్",
            message:
                "మీ వార్డు {{name}} (రోల్ నం: {{rollNo}}), {{year}} వ సంవత్సరం, CSE-{{section}} విద్యార్థి, {{fromDate}} నుండి {{toDate}} వరకు హాజరు శాతం {{attendance}}% గా ఉంది.",
            contact: "మరింత సమాచారం కోసం, దయచేసి విభాగాధిపతి/ప్రిన్సిపాల్‌ను సంప్రదించండి.",
            phone: "ఫోన్: +91 81219 79628",
        },
    },
    hi: {
        translation: {
            college: "नारायण इंजीनियरिंग कॉलेज, गुडूर",
            dept: "सीएसई विभाग",
            alert: "एनरीच उपस्थिति अलर्ट",
            message:
                "आपके वार्ड {{name}} (रोल नं: {{rollNo}}), {{year}} वर्ष, CSE-{{section}} की {{fromDate}} से {{toDate}} तक उपस्थिति {{attendance}}% है।",
            contact:
                "अधिक जानकारी के लिए कृपया विभागाध्यक्ष/प्राचार्य से संपर्क करें।",
            phone: "फ़ोन: +91 81219 79628",
        },
    },
    ta: {
        translation: {
            college: "நாராயணா பொறியியல் கல்லூரி, குடூர்",
            dept: "கணினி அறிவியல் துறை",
            alert: "என்-ரீச் வருகை எச்சரிக்கை",
            message:
                "உங்கள் மாணவர் {{name}} (பதிவு எண்: {{rollNo}}), {{year}} ஆம் ஆண்டு, CSE-{{section}}, {{fromDate}} முதல் {{toDate}} வரை வருகை {{attendance}}% உள்ளது.",
            contact:
                "மேலும் விவரங்களுக்கு துறைத் தலைவர்/பிரின்சிபாலை தொடர்பு கொள்ளவும்.",
            phone: "தொலைபேசி: +91 81219 79628",
        },
    },
};

i18n.use(initReactI18next).init({
    resources,
    lng: navigator.language.startsWith("te")
        ? "te"
        : navigator.language.startsWith("hi")
            ? "hi"
            : navigator.language.startsWith("ta")
                ? "ta"
                : "en", // ✅ detect browser language
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
