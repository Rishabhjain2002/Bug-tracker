import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Board from './pages/Board';
import TicketFormPage from './pages/TicketFormPage';
import Projects from './pages/Projects';
import Users from './pages/Users';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="layout">
          <Sidebar />
          <main className="content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<ProtectedRoute><Board /></ProtectedRoute>} />
              <Route path="/tickets/new" element={<ProtectedRoute><TicketFormPage /></ProtectedRoute>} />
              <Route path="/tickets/:id" element={<ProtectedRoute><TicketFormPage /></ProtectedRoute>} />
              <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
