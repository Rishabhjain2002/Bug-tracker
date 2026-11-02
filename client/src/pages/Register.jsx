import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useForm from '../hooks/useForm';
import useSubmit from '../hooks/useSubmit';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const { values, handleChange } = useForm({ name: '', email: '', password: '' });
  const { submit, error, submitting } = useSubmit(async () => {
    await register(values.name, values.email, values.password);
    navigate('/');
  });

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  return (
    <AuthLayout title="Create your account" subtitle="New accounts join as members">
      <form className="form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <label className="field">
          Full name
          <input name="name" value={values.name} onChange={handleChange} placeholder="Jane Doe" required />
        </label>
        <label className="field">
          Email
          <input type="email" name="email" value={values.email} onChange={handleChange} placeholder="you@company.com" required />
        </label>
        <label className="field">
          Password
          <input
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            minLength={6}
            required
          />
        </label>
        <button className="btn btn-block" type="submit" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="muted auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
