import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import AuthLayout from '../components/AuthLayout';

// Accounts created by `npm run seed`, so reviewers can try both roles in one click
const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@bugtracker.com', password: 'Admin@123' },
  { label: 'Member', email: 'member@bugtracker.com', password: 'Member@123' },
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const signIn = async (email, password) => {
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signIn(form.email, form.password);
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your workspace">
      <form className="form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <label className="field">
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" required />
        </label>
        <label className="field">
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <button className="btn btn-block" type="submit" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <div className="divider">or try a demo account</div>
      <div className="demo-buttons">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.label}
            className="btn btn-secondary"
            disabled={submitting}
            onClick={() => signIn(account.email, account.password)}
          >
            {account.label}
          </button>
        ))}
      </div>

      <p className="muted auth-switch">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
