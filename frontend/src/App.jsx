import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DatabaseProvider } from "./context/DatabaseContext";
import { ToastProvider } from "./components/Toast";
import ProtectedRoute from "./components/ProtectedRoute";
import { useIdleLogout } from "./hooks/useIdleLogout";
import { useAuth } from "./hooks/useAuth";
import { triggerCheck } from "./api/alertApi";
import { useEffect } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import QueryLab from "./pages/QueryLab";
import History from "./pages/History";
import Settings from "./pages/Settings";

function IdleLogoutWatcher() {
  useIdleLogout();
  return null;
}

function AlertWatcher() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    triggerCheck().catch(() => {});
    const interval = setInterval(() => {
      triggerCheck().catch(() => {});
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <ToastProvider>
          <BrowserRouter>
            <IdleLogoutWatcher />
            <AlertWatcher />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/query" element={<ProtectedRoute><QueryLab /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </DatabaseProvider>
    </AuthProvider>
  );
}