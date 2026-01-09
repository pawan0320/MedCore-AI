import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import AIAssistant from './pages/AIAssistant';
import Booking from './pages/Booking';
import Emergency from './pages/Emergency';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Unauthorized from './pages/Unauthorized';
import VideoCall from './pages/VideoCall';
import MedicalRecords from './pages/MedicalRecords';
import { Role } from './types';
import { useAuth } from './context/AuthContext';

// Helper to wrap Layout around protected pages
const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/login" />;
  
  return (
    <Layout userRole={user.role} onLogout={logout} user={user}>
      <Routes>
        {/* PUBLIC ACCESS FOR AUTHENTICATED USERS */}
        <Route path="/" element={<Navigate to="/ai-assistant" />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        
        {/* SHARED ACCESS */}
        <Route element={<ProtectedRoute allowedRoles={[Role.PATIENT, Role.DOCTOR, Role.ADMIN]} />}>
           <Route path="/booking" element={<Booking />} />
           <Route path="/video-call/:id" element={<VideoCall />} />
           <Route path="/records" element={<MedicalRecords />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[Role.DOCTOR, Role.ADMIN]} />}>
           <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[Role.PATIENT, Role.ADMIN, Role.DOCTOR]} />}>
           <Route path="/emergency" element={<Emergency />} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;