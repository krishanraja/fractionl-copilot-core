import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface InlineSuccessProps {
  show: boolean;
  message?: string;
  duration?: number;
  onComplete?: () => void;
}

export const InlineSuccess = ({ 
  show, 
  message = 'Saved', 
  duration = 2000,
  onComplete 
}: InlineSuccessProps) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="inline-flex items-center gap-1.5 text-success text-sm font-medium"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
            className="w-4 h-4 rounded-full bg-success/20 flex items-center justify-center"
          >
            <Check className="w-3 h-3" />
          </motion.div>
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook for managing save state with auto-dismiss
export const useSaveState = () => {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startSaving = () => {
    setSaveState('saving');
    setErrorMessage(null);
  };

  const saveSuccess = () => {
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 2000);
  };

  const saveError = (message: string) => {
    setSaveState('error');
    setErrorMessage(message);
  };

  const reset = () => {
    setSaveState('idle');
    setErrorMessage(null);
  };

  return {
    saveState,
    errorMessage,
    isSaving: saveState === 'saving',
    isSaved: saveState === 'saved',
    isError: saveState === 'error',
    startSaving,
    saveSuccess,
    saveError,
    reset
  };
};
