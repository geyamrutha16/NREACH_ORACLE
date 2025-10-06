import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import usePwaInstallPrompt from "./usePwaInstallPrompt";
import Ack from "./pages/Ack";
import Login from "./pages/Login";
import SmsTable from "./pages/SmsTable";

function App() {
  const { showInstallReminder, promptInstall } = usePwaInstallPrompt();

  return (
    <Router>
      {/* PWA Install Reminder Overlay */}
      {showInstallReminder && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            padding: 15,
            background: "#2563eb",
            color: "#fff",
            borderRadius: 10,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            zIndex: 1000,
          }}
        >
          <p>Install this app for a better experience!</p>
          <button
            onClick={promptInstall}
            style={{
              marginTop: 10,
              padding: "8px 12px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              background: "#16a34a",
              color: "#fff",
            }}
          >
            Install
          </button>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/ack/:smsId" element={<Ack />} />
        <Route path="/trackboard" element={<SmsTable />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;

/*import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Ack from "./pages/Ack";
import Login from "./pages/Login";
import SmsTable from "./pages/SmsTable";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/ack/:smsId" element={<Ack />} />
        <Route path="/trackboard" element={<SmsTable />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
*/
