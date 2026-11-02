import { useCallback, useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';

// Loads `path` from the API when the component mounts; call reload() to fetch it again after a change
export default function useFetch(path, initialData = []) {
  const showToast = useToast();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(
    () =>
      api
        .get(path)
        .then((res) => setData(res.data))
        .catch((err) => showToast(getErrorMessage(err), 'error'))
        .finally(() => setLoading(false)),
    [path, showToast]
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, setData, loading, reload };
}
