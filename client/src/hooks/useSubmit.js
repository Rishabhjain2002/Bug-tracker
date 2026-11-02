import { useState } from 'react';
import { getErrorMessage } from '../api/client';

// Wraps an async action for a form: tracks `submitting` and keeps the API error message to show.
// `submitting` stays true on success because every form using this closes or navigates away.
export default function useSubmit(action) {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (...args) => {
    setError('');
    setSubmitting(true);
    try {
      await action(...args);
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return { submit, error, submitting };
}
