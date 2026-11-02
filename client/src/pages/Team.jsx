import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useFetch from '../hooks/useFetch';
import { formatDate } from '../utils';
import Avatar from '../components/Avatar';
import ConfirmDialog from '../components/ConfirmDialog';
import MemberModal from '../components/MemberModal';
import PageHeader from '../components/PageHeader';

// Everyone can see the team; only admins can add, edit and remove members
export default function Team() {
  const { user: currentUser } = useAuth();
  const showToast = useToast();
  const isAdmin = currentUser.role === 'admin';
  const { data: users, setData: setUsers } = useFetch('/users');
  // null = closed, { member: null } = add, { member } = edit
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

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
      const res = await api.patch(`/users/${user.id}`, { role });
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
      <PageHeader
        title="Team"
        subtitle={`${users.length} people in this workspace`}
        action={
          isAdmin && (
            <button className="btn" onClick={() => setEditing({ member: null })}>
              <Plus size={16} /> Add member
            </button>
          )
        }
      />

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
