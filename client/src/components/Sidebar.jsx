import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import Badge from './Badge';

export default function Sidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-logo">BT</span>
        Bug Tracker
      </div>

      <nav className="side-nav">
        <NavLink to="/" end>Board</NavLink>
        <NavLink to="/projects">Projects</NavLink>
        {user.role === 'admin' && <NavLink to="/users">Users</NavLink>}
      </nav>

      <div className="side-user">
        <Avatar id={user.id} name={user.name} />
        <div className="side-user-info">
          <span>{user.name}</span>
          <Badge value={user.role} />
        </div>
        <button className="btn btn-secondary" onClick={logout}>Logout</button>
      </div>
    </aside>
  );
}
