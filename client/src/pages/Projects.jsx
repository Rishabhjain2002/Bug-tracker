import { useCallback, useEffect, useState } from 'react';
import { FolderKanban, Pencil, Plus, Trash2 } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const COLORS = ['#0c66e4', '#1f845a', '#6e5dc6', '#d97008', '#1d7f8c', '#e2483d'];

// Create / edit form shown in a modal (admin only)
function ProjectModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState({ name: project?.name || '', description: project?.description || '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (project) await api.put(`/projects/${project.id}`, form);
      else await api.post('/projects', form);
      onSaved(project ? 'Project updated' : 'Project created');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Modal title={project ? 'Edit project' : 'Create project'} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <label className="field">
          Name
          <input name="name" value={form.name} onChange={handleChange} required maxLength={150} autoFocus />
        </label>
        <label className="field">
          Description
          <textarea name="description" rows={3} value={form.description} onChange={handleChange} />
        </label>
        <div className="modal-footer">
          <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="btn" type="submit">{project ? 'Save changes' : 'Create'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Projects() {
  const { user } = useAuth();
  const showToast = useToast();
  const isAdmin = user.role === 'admin';
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  // null = closed, { project: null } = create, { project } = edit
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const loadProjects = useCallback(() => {
    api
      .get('/projects')
      .then((res) => setProjects(res.data))
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSaved = (message) => {
    showToast(message);
    setEditing(null);
    loadProjects();
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/projects/${deleting.id}`);
      showToast(`Project "${deleting.name}" deleted`);
      loadProjects();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
    setDeleting(null);
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p className="muted">{projects.length} project{projects.length === 1 ? '' : 's'}</p>
        </div>
        {isAdmin && (
          <button className="btn" onClick={() => setEditing({ project: null })}>
            <Plus size={16} /> Create project
          </button>
        )}
      </div>

      {!loading && projects.length === 0 ? (
        <div className="empty-state">
          <FolderKanban size={40} />
          <h3>No projects yet</h3>
          <p className="muted">{isAdmin ? 'Create a project to start tracking tickets.' : 'Ask an admin to create one.'}</p>
        </div>
      ) : (
        <div className="grid">
          {projects.map((project) => (
            <div className="project-card" key={project.id}>
              <div className="project-card-header">
                <span className="project-icon" style={{ background: COLORS[project.id % COLORS.length] }}>
                  {project.name[0].toUpperCase()}
                </span>
                <h3>{project.name}</h3>
                {isAdmin && (
                  <div className="card-actions">
                    <button className="icon-btn" title="Edit project" onClick={() => setEditing({ project })}>
                      <Pencil size={16} />
                    </button>
                    <button className="icon-btn" title="Delete project" onClick={() => setDeleting(project)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              <p className="muted project-description">{project.description || 'No description'}</p>
              <div className="project-footer">
                <span>{project.ticket_count} ticket{project.ticket_count === 1 ? '' : 's'}</span>
                <span>Created {formatDate(project.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <ProjectModal project={editing.project} onClose={() => setEditing(null)} onSaved={handleSaved} />}
      {deleting && (
        <ConfirmDialog
          title="Delete project?"
          message={`"${deleting.name}" and all ${deleting.ticket_count} of its tickets will be permanently deleted.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </section>
  );
}
