import React, { useState } from 'react';
import { Login } from './Login';
import { Register } from './Register';

export const AuthContainer: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return mode === 'login' ? (
    <Login onToggleMode={toggleMode} />
  ) : (
    <Register onToggleMode={toggleMode} />
  );
};