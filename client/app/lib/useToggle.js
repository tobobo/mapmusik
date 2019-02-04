import { useState } from 'react';

const useToggle = (initialState = false) => {
  const [enabled, setEnabled] = useState(initialState);
  const enable = () => setEnabled(true);
  const disable = () => setEnabled(false);
  return { enabled, enable, disable };
};

export default useToggle;
