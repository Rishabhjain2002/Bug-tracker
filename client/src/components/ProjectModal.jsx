import api from '../api/client';
import useForm from '../hooks/useForm';
import FormModal from './FormModal';

// Create a project when `project` is null, otherwise edit it (admin only)
export default function ProjectModal({ project, onClose, onSaved }) {
  const { values, handleChange } = useForm({ name: project?.name || '', description: project?.description || '' });

  const handleSubmit = async () => {
    if (project) await api.put(`/projects/${project.id}`, values);
    else await api.post('/projects', values);
    onSaved(project ? 'Project updated' : 'Project created');
  };

  return (
    <FormModal
      title={project ? 'Edit project' : 'Create project'}
      submitLabel={project ? 'Save changes' : 'Create'}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <label className="field">
        Name
        <input name="name" value={values.name} onChange={handleChange} required maxLength={150} autoFocus />
      </label>
      <label className="field">
        Description
        <textarea name="description" rows={3} value={values.description} onChange={handleChange} />
      </label>
    </FormModal>
  );
}
