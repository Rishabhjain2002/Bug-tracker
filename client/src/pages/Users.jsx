import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

// Admin-only page for managing user roles
export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/users')
      .then((res) => setUsers(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const handleRoleChange = async (user, role) => {
    setError('');
    try {
      const res = await api.put(`/users/${user.id}`, { role });
      setUsers(users.map((u) => (u.id === user.id ? res.data : u)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"?`)) return;
    setError('');
    try {
      await api.delete(`/users/${user.id}`);
      setUsers(users.filter((u) => u.id !== user.id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <section>
      <h1>Users</h1>
      {error && <p className="error">{error}</p>}

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentUser.id;
            return (
              <tr key={user.id}>
                <td data-label="Name">{user.name}{isSelf && ' (you)'}</td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Role">
                  <select value={user.role} disabled={isSelf} onChange={(e) => handleRoleChange(user, e.target.value)}>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="actions">
                  {!isSelf && (
                    <button className="btn btn-danger" onClick={() => handleDelete(user)}>Delete</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
