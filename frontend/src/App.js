import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
