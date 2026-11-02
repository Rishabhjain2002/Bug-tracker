import { useState } from 'react';
import { FolderKanban, Pencil, Plus, Trash2 } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { colorFor } from '../constants';
import useFetch from '../hooks/useFetch';
import { formatDate } from '../utils';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import ProjectModal from '../components/ProjectModal';

export default function Projects() {
  const { user } = useAuth();
  const showToast = useToast();
  const isAdmin = user.role === 'admin';
  const { data: projects, loading, reload } = useFetch('/projects');
  // null = closed, { project: null } = create, { project } = edit
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const handleSaved = (message) => {
    showToast(message);
    setEditing(null);
    reload();
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/projects/${deleting.id}`);
      showToast(`Project "${deleting.name}" deleted`);
      reload();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
    setDeleting(null);
  };

  return (
    <section>
      <PageHeader
        title="Projects"
        subtitle={`${projects.length} project${projects.length === 1 ? '' : 's'}`}
        action={
          isAdmin && (
            <button className="btn" onClick={() => setEditing({ project: null })}>
              <Plus size={16} /> Create project
            </button>
          )
        }
      />

      {!loading && projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={40} />}
          title="No projects yet"
          message={isAdmin ? 'Create a project to start tracking tickets.' : 'Ask an admin to create one.'}
        />
      ) : (
        <div className="grid">
          {projects.map((project) => (
            <div className="project-card" key={project.id}>
              <div className="project-card-header">
                <span className="project-icon" style={{ background: colorFor(project) }}>
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
