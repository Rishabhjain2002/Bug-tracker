import { useState } from 'react';

// Form values keyed by input name; handleChange works for any <input>, <select> or <textarea> with a name
export default function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);

  const handleChange = (e) => setValues((current) => ({ ...current, [e.target.name]: e.target.value }));
  const setValue = (name, value) => setValues((current) => ({ ...current, [name]: value }));

  return { values, handleChange, setValue };
}
