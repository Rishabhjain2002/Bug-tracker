import { Bug, Check } from 'lucide-react';

const FEATURES = [
  'Kanban board with drag and drop',
  'Assign tickets and set priorities',
  'Role-based access for admins and members',
];

// Two-panel layout shared by the login and register pages
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="brand">
          <span className="brand-logo"><Bug size={18} /></span>
          Bug Tracker
        </div>
        <h2>Plan, track and fix bugs as a team.</h2>
        <ul>
          {FEATURES.map((feature) => (
            <li key={feature}><Check size={18} /> {feature}</li>
          ))}
        </ul>
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
