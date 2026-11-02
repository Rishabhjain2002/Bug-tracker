import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useForm from '../hooks/useForm';
import useSubmit from '../hooks/useSubmit';
import AuthLayout from '../components/AuthLayout';

// Accounts created by `npm run seed`, so reviewers can try both roles in one click
const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@demo.com', password: 'admin123' },
  { label: 'Member', email: 'member@demo.com', password: 'member123' },
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { values, handleChange } = useForm({ email: '', password: '' });
  const { submit: signIn, error, submitting } = useSubmit(async (email, password) => {
    await login(email, password);
    navigate('/');
  });

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = (e) => {
    e.preventDefault();
    signIn(values.email, values.password);
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your workspace">
      <form className="form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <label className="field">
          Email
          <input type="email" name="email" value={values.email} onChange={handleChange} placeholder="you@company.com" required />
        </label>
        <label className="field">
          Password
          <input type="password" name="password" value={values.password} onChange={handleChange} required />
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
