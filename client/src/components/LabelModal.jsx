import api from '../api/client';
import { COLORS } from '../constants';
import useForm from '../hooks/useForm';
import ColorPicker from './ColorPicker';
import FormModal from './FormModal';
import LabelChip from './LabelChip';

// Create a label when `label` is null, otherwise edit it (admin only)
export default function LabelModal({ label, onClose, onSaved }) {
  const { values, handleChange, setValue } = useForm({ name: label?.name || '', color: label?.color || COLORS[0].value });

  const handleSubmit = async () => {
    if (label) await api.put(`/labels/${label.id}`, values);
    else await api.post('/labels', values);
    onSaved(label ? 'Label updated' : 'Label created');
  };

  return (
    <FormModal
      title={label ? 'Edit label' : 'Create label'}
      submitLabel={label ? 'Save changes' : 'Create'}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <div className="label-preview">
        <LabelChip label={{ name: values.name || 'Label preview', color: values.color }} />
      </div>
      <label className="field">
        Name
        <input name="name" value={values.name} onChange={handleChange} required maxLength={50} autoFocus />
      </label>
      {/* A div, not a label: a label would forward clicks to the first swatch */}
      <div className="field">
        Color
        <ColorPicker value={values.color} onChange={(color) => setValue('color', color)} />
      </div>
    </FormModal>
  );
}
