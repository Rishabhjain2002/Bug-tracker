import useSubmit from '../hooks/useSubmit';
import Modal from './Modal';

// Modal with a form, an error message and Cancel / submit buttons.
// If onSubmit throws, the API error is shown above the fields and the modal stays open.
export default function FormModal({ title, submitLabel, onSubmit, onClose, children }) {
  const { submit, error, submitting } = useSubmit(onSubmit);

  const handleSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        {children}
        <div className="modal-footer">
          <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
