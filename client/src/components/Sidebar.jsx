import { NavLink } from 'react-router-dom';
import { Bug, FolderKanban, LogOut, SquareKanban, Tags, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function Sidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-logo"><Bug size={18} /></span>
        Bug Tracker
      </div>

      <nav className="side-nav">
        <NavLink to="/" end><SquareKanban size={18} /> Board</NavLink>
        <NavLink to="/projects"><FolderKanban size={18} /> Projects</NavLink>
        <NavLink to="/team"><Users size={18} /> Team</NavLink>
        <NavLink to="/labels"><Tags size={18} /> Labels</NavLink>
      </nav>

      <div className="side-user">
        <Avatar id={user.id} name={user.name} color={user.color} />
        <div className="side-user-info">
          <span className="side-user-name">{user.name}</span>
          <span className="muted small">{user.role === 'admin' ? 'Admin' : 'Member'}</span>
        </div>
        <button className="icon-btn" onClick={logout} title="Log out" aria-label="Log out">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
