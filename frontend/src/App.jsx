import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Documents from "./pages/Documents";
import Admin from "./pages/Admin";
import ManagerDashboard from "./pages/ManagerDashboard";
import FinanceDashboard from "./pages/FinanceDashboard";
import Register from "./pages/Register";
import AdminUsers from "./pages/AdminUsers";
import ExportReport from "./pages/ExportReport";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/manager" element={<ManagerDashboard />} />
      <Route path="/finance" element={<FinanceDashboard />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/export-report" element={<ExportReport />} />
    </Routes>
  );
}

export default App;