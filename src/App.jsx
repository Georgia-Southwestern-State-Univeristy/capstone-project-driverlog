import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Assignments from "./pages/Assignments";
import Reports from "./pages/Reports";
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
