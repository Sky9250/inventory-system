import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Package, Lock, Mail } from 'lucide-react';
import '../styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  
  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    const success = login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  const demoAccounts = [
    { email: 'admin@company.com', password: 'admin123', role: 'Admin — Full Access' },
    { email: 'production@company.com', password: 'prod123', role: 'Production Manager' },
    { email: 'dispatch@company.com', password: 'disp123', role: 'Dispatch Manager' },
    { email: 'manager@company.com', password: 'manager123', role: 'Manager' },
  ];

  const loginAsDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    const success = login(demoEmail, demoPassword);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">
              <Package size={32} />
            </div>
            <h1>Inventory System</h1>
            <p>Manage your products and stock efficiently</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message animate-fade-in">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="label">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                className="input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="label">
                <Lock size={16} />
                Password
              </label>
              <input
                type="password"
                className="input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full">
              Sign In
            </button>
          </form>

          <div className="login-divider">
            <span>Demo Accounts</span>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-full"
            onClick={() => setShowDemo(!showDemo)}
          >
            {showDemo ? 'Hide' : 'Show'} Demo Credentials
          </button>

          {showDemo && (
            <div className="demo-accounts animate-fade-in">
              {demoAccounts.map((account, index) => (
                <div key={index} className="demo-account-card">
                  <div className="demo-account-info">
                    <div className="demo-account-role">{account.role}</div>
                    <div className="demo-account-email">{account.email}</div>
                    <div className="demo-account-password">Password: {account.password}</div>
                  </div>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => loginAsDemo(account.email, account.password)}
                  >
                    Login
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="login-footer">
            <p>Built with React • Production Ready</p>
          </div>
        </div>
      </div>
    </div>
  );
}
