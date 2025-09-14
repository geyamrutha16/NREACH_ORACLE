import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Ack from "./pages/Ack";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ack/:smsId" element={<Ack />} />
        {/* fallback route */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
