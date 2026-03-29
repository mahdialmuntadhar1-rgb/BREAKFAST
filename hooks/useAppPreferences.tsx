import React, { createContext, useContext, useMemo, useState } from 'react';

interface AppPreferencesContextValue {
  governorate: string;
  setGovernorate: (value: string) => void;
}

const AppPreferencesContext = createContext<AppPreferencesContextValue | undefined>(undefined);

export const AppPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [governorate, setGovernorateState] = useState(() => localStorage.getItem('iraq-compass-governorate') || 'all');

  const setGovernorate = (value: string) => {
    setGovernorateState(value);
    localStorage.setItem('iraq-compass-governorate', value);
  };

  const value = useMemo(() => ({ governorate, setGovernorate }), [governorate]);

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
};

export const useAppPreferences = () => {
  const ctx = useContext(AppPreferencesContext);
  if (!ctx) throw new Error('useAppPreferences must be used inside AppPreferencesProvider');
  return ctx;
};
