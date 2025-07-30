import { useState, useEffect } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { PasswordGate } from '@/components/PasswordGate';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authenticated = localStorage.getItem('app_authenticated') === 'true';
    setIsAuthenticated(authenticated);
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <PasswordGate onAuthenticated={handleAuthenticated} />;
  }

  return <Dashboard />;
};

export default Index;