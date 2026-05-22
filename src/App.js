import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Admin from './pages/Admin';
import Cafe from './pages/Cafe';
import './App.css';

function ProtectedRoute({ children, isAdmin = false }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (isAdmin && !user?.isAdmin) {
    return <Navigate to="/menu" />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route path="/menu" element={<Menu />} />
        <Route path="/cafe" element={<Cafe />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute isAdmin={true}>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
