import { Routes, Route } from "react-router-dom";

import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Upload from "./Pages/Upload";
import Documents from "./Pages/Documents";
import Admin from "./Pages/Admin";
import Register from "./Pages/Register";
import ManagerDashboard from "./Pages/ManagerDashboard";
import FinanceDashboard from "./Pages/FinanceDashboard";
import ExportReport from "./Pages/ExportReport";
import AdminUsers from "./Pages/AdminUsers";


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