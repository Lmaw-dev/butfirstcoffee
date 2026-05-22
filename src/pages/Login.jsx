import { useState } from 'react';
// marker to force deploy rebuild when pushed: DO NOT REMOVE
console.log('deploy-marker: login source loaded');
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Login.css';
import BackButton from '../components/BackButton';

export default function Login() {
  const [username, setUsername] = useState('jireh');
  const [password, setPassword] = useState('faith');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.login(username, password);
      
      if (result.success) {
        if (result.staff?.isAdmin) {
          login(result.staff);
          navigate('/admin');
        } else {
          await logout();
          setError('Admin access only. Please use an admin account.');
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
          <div className="login-header">
            <BackButton to="/" />
            <h1>But First, Coffee</h1>
              <p>Admin Login</p>
          </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="jireh"
              autoComplete="username"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="faith"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>This login is for admin access only. Use the staff username and password stored in Supabase.</p>
        </div>
      </div>
    </div>
  );
}
