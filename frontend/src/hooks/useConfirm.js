import { useState, useCallback } from 'react';

export default function useConfirm() {
  const [state, setState] = useState({ show: false, message: '', resolve: null });

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setState({ show: true, message, resolve });
    });
  }, []);

  const handleConfirm = () => {
    state.resolve?.(true);
    setState({ show: false, message: '', resolve: null });
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState({ show: false, message: '', resolve: null });
  };

  return { confirm, state, handleConfirm, handleCancel };
}
