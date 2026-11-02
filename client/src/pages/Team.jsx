import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { COLORS, colorFor } from '../constants';
import { formatDate } from '../utils';
import Avatar from '../components/Avatar';
import ColorPicker from '../components/ColorPicker';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';

// Add / edit form (admin only); email and password can only be set when adding
function MemberModal({ member, onClose, onSaved }) {
  const isNew = !member;
  const [form, setForm] = useState({
    name: member?.name || '',
    email: '',
    password: '',
    role: 'member',
    job_title: member?.job_title || '',
    // A new member gets a random colour so the team does not all start out blue
    color: member ? colorFor(member) : COLORS[Math.floor(Math.random() * COLORS.length)].value,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const { name, job_title, color } = form;
      const res = isNew ? await api.post('/users', form) : await api.put(`/users/${member.id}`, { name, job_title, color });
      onSaved(res.data, isNew);
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal title={isNew ? 'Add team member' : `Edit ${member.name}`} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}

        <div className="member-preview">
          <Avatar id={member?.id} name={form.name || '?'} color={form.color} />
          <div>
            <div className="user-name">{form.name || 'New member'}</div>
            <div className="muted small">{form.job_title || 'No job title'}</div>
          </div>
        </div>

        <label className="field">
          Name
          <input name="name" value={form.name} onChange={handleChange} required maxLength={100} autoFocus />
        </label>
        {isNew && (
          <>
            <label className="field">
              Email
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </label>
            <label className="field">
              Password
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="At least 6 characters; share it with them"
              />
            </label>
          </>
        )}
        <label className="field">
          Job title
          <input
            name="job_title"
            value={form.job_title}
            onChange={handleChange}
            maxLength={100}
            placeholder="e.g. Frontend Developer"
          />
        </label>
        {isNew && (
          <label className="field">
            Role
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        )}
        <div className="field">
          Color
          <ColorPicker value={form.color} onChange={(color) => setForm({ ...form, color })} />
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Saving...' : isNew ? 'Add member' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Everyone can see the team; only admins can add, edit and remove members
export default function Team() {
  const { user: currentUser } = useAuth();
  const showToast = useToast();
  const isAdmin = currentUser.role === 'admin';
  const [users, setUsers] = useState([]);
  // null = closed, { member: null } = add, { member } = edit
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    api
      .get('/users')
      .then((res) => setUsers(res.data))
      .catch((err) => showToast(getErrorMessage(err), 'error'));
  }, [showToast]);

  const handleSaved = (saved, isNew) => {
    setUsers((current) =>
      isNew
        ? [...current, saved].sort((a, b) => a.name.localeCompare(b.name))
        : current.map((u) => (u.id === saved.id ? saved : u))
    );
    showToast(isNew ? `${saved.name} added to the team` : `${saved.name} updated`);
    setEditing(null);
  };

  const handleRoleChange = async (user, role) => {
    try {
      const res = await api.put(`/users/${user.id}`, { role });
      setUsers(users.map((u) => (u.id === user.id ? res.data : u)));
      showToast(`${user.name} is now ${role === 'admin' ? 'an admin' : 'a member'}`);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deleting.id}`);
      setUsers(users.filter((u) => u.id !== deleting.id));
      showToast(`${deleting.name} removed`);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
    setDeleting(null);
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Team</h1>
          <p className="muted">{users.length} people in this workspace</p>
        </div>
        {isAdmin && (
          <button className="btn" onClick={() => setEditing({ member: null })}>
            <Plus size={16} /> Add member
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Job title</th>
              <th>Role</th>
              <th>Open tickets</th>
              <th>Joined</th>
              {isAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === currentUser.id;
              return (
                <tr key={user.id}>
                  <td data-label="Member">
                    <div className="user-cell">
                      <Avatar id={user.id} name={user.name} color={user.color} />
                      <div>
                        <div className="user-name">
                          {user.name} {isSelf && <span className="tag">You</span>}
                        </div>
                        <div className="muted small">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Job title">{user.job_title || <span className="muted">—</span>}</td>
                  <td data-label="Role">
                    {isAdmin ? (
                      <select
                        className="role-select"
                        value={user.role}
                        disabled={isSelf}
                        title={isSelf ? 'You cannot change your own role' : undefined}
                        onChange={(e) => handleRoleChange(user, e.target.value)}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`role-badge role-${user.role}`}>{user.role === 'admin' ? 'Admin' : 'Member'}</span>
                    )}
                  </td>
                  <td data-label="Open tickets">{user.open_tickets}</td>
                  <td data-label="Joined">{formatDate(user.created_at)}</td>
                  {isAdmin && (
                    <td className="row-actions">
                      <button className="icon-btn" title="Edit member" onClick={() => setEditing({ member: user })}>
                        <Pencil size={16} />
                      </button>
                      {!isSelf && (
                        <button className="icon-btn" title="Remove member" onClick={() => setDeleting(user)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && <MemberModal member={editing.member} onClose={() => setEditing(null)} onSaved={handleSaved} />}
      {deleting && (
        <ConfirmDialog
          title="Remove team member?"
          message={`${deleting.name} will lose access. Their tickets stay, but become unassigned.`}
          confirmLabel="Remove"
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </section>
  );
}
