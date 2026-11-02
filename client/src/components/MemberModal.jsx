import api from '../api/client';
import { COLORS, colorFor } from '../constants';
import useForm from '../hooks/useForm';
import Avatar from './Avatar';
import ColorPicker from './ColorPicker';
import FormModal from './FormModal';

const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)].value;

// Add a team member when `member` is null, otherwise edit them (admin only).
// Email, password and role are only set when adding; roles are changed from the team table.
export default function MemberModal({ member, onClose, onSaved }) {
  const isNew = !member;
  const { values, handleChange, setValue } = useForm({
    name: member?.name || '',
    email: '',
    password: '',
    role: 'member',
    job_title: member?.job_title || '',
    // A random colour so new members do not all start out the same
    color: member ? colorFor(member) : randomColor(),
  });

  const handleSubmit = async () => {
    const { name, job_title, color } = values;
    const res = isNew ? await api.post('/users', values) : await api.patch(`/users/${member.id}`, { name, job_title, color });
    onSaved(res.data, isNew);
  };

  return (
    <FormModal
      title={isNew ? 'Add team member' : `Edit ${member.name}`}
      submitLabel={isNew ? 'Add member' : 'Save changes'}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <div className="member-preview">
        <Avatar id={member?.id} name={values.name || '?'} color={values.color} />
        <div>
          <div className="user-name">{values.name || 'New member'}</div>
          <div className="muted small">{values.job_title || 'No job title'}</div>
        </div>
      </div>

      <label className="field">
        Name
        <input name="name" value={values.name} onChange={handleChange} required maxLength={100} autoFocus />
      </label>
      {isNew && (
        <>
          <label className="field">
            Email
            <input name="email" type="email" value={values.email} onChange={handleChange} required />
          </label>
          <label className="field">
            Password
            <input
              name="password"
              type="password"
              value={values.password}
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
          value={values.job_title}
          onChange={handleChange}
          maxLength={100}
          placeholder="e.g. Frontend Developer"
        />
      </label>
      {isNew && (
        <label className="field">
          Role
          <select name="role" value={values.role} onChange={handleChange}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </label>
      )}
      {/* A div, not a label: a label would forward clicks to the first swatch */}
      <div className="field">
        Color
        <ColorPicker value={values.color} onChange={(color) => setValue('color', color)} />
      </div>
    </FormModal>
  );
}
