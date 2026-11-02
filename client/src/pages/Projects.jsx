import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

const EMPTY_PROJECT = { name: '', description: '' };

export default function Projects() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const loadProjects = () =>
    api
      .get('/projects')
      .then((res) => setProjects(res.data))
      .catch((err) => setError(getErrorMessage(err)));

  useEffect(() => {
    loadProjects();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(EMPTY_PROJECT);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) await api.put(`/projects/${editingId}`, form);
      else await api.post('/projects', form);
      resetForm();
      loadProjects();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const startEdit = (project) => {
    setEditingId(project.id);
    setForm({ name: project.name, description: project.description || '' });
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete "${project.name}" and all its tickets?`)) return;
    try {
      await api.delete(`/projects/${project.id}`);
      loadProjects();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <section>
      <h1>Projects</h1>
      {error && <p className="error">{error}</p>}

      {isAdmin && (
        <form className="card form" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit Project' : 'New Project'}</h2>
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required maxLength={150} />
          </label>
          <label>
            Description
            <textarea name="description" rows={2} value={form.description} onChange={handleChange} />
          </label>
          <div className="actions">
            <button className="btn" type="submit">{editingId ? 'Save changes' : 'Create project'}</button>
            {editingId && (
              <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel</button>
            )}
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        <p className="muted">No projects yet.</p>
      ) : (
        <div className="grid">
          {projects.map((project) => (
            <div className="card" key={project.id}>
              <h3>{project.name}</h3>
              <p className="muted">{project.description || 'No description'}</p>
              {isAdmin && (
                <div className="actions">
                  <button className="btn btn-secondary" onClick={() => startEdit(project)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(project)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
