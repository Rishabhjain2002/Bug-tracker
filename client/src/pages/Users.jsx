import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils';
import Avatar from '../components/Avatar';
import ConfirmDialog from '../components/ConfirmDialog';

// Admin-only page for managing user roles
export default function Users() {
  const { user: currentUser } = useAuth();
  const showToast = useToast();
  const [users, setUsers] = useState([]);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    api
      .get('/users')
      .then((res) => setUsers(res.data))
      .catch((err) => showToast(getErrorMessage(err), 'error'));
  }, [showToast]);

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
          <h1>Users</h1>
          <p className="muted">{users.length} people in this workspace</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === currentUser.id;
              return (
                <tr key={user.id}>
                  <td data-label="User">
                    <div className="user-cell">
                      <Avatar id={user.id} name={user.name} />
                      <div>
                        <div className="user-name">
                          {user.name} {isSelf && <span className="tag">You</span>}
                        </div>
                        <div className="muted small">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Role">
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
                  </td>
                  <td data-label="Joined">{formatDate(user.created_at)}</td>
                  <td className="row-actions">
                    {!isSelf && (
                      <button className="icon-btn" title="Remove user" onClick={() => setDeleting(user)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {deleting && (
        <ConfirmDialog
          title="Remove user?"
          message={`${deleting.name} will lose access. Their tickets stay, but become unassigned.`}
          confirmLabel="Remove"
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </section>
  );
}
