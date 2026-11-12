import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { GuestRoute, ProtectedRoute } from "./components/RouteGuards.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import DocumentsPage from "./pages/DocumentsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/chat/:conversationId?" element={<ChatPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
