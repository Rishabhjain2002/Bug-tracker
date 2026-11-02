import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Badge from './Badge';

export default function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <header className="navbar">
      <span className="brand">Bug Tracker</span>
      <nav className="nav-links">
        <NavLink to="/" end>Tickets</NavLink>
        <NavLink to="/projects">Projects</NavLink>
        {user.role === 'admin' && <NavLink to="/users">Users</NavLink>}
      </nav>
      <div className="nav-user">
        <span>{user.name}</span>
        <Badge value={user.role} />
        <button className="btn btn-secondary" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
