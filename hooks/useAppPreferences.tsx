import React, { createContext, useContext, useMemo, useState } from 'react';

type AppPreferencesContextType = {
  governorate: string;
  setGovernorate: (value: string) => void;
};

const AppPreferencesContext = createContext<AppPreferencesContextType | undefined>(undefined);

export const AppPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [governorate, setGovernorateState] = useState<string>(() => localStorage.getItem('iraq-compass-governorate') || 'all');

  const setGovernorate = (value: string) => {
    setGovernorateState(value);
    localStorage.setItem('iraq-compass-governorate', value);
  };

  const value = useMemo(() => ({ governorate, setGovernorate }), [governorate]);

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
};

export const useAppPreferences = () => {
  const context = useContext(AppPreferencesContext);
  if (!context) {
    throw new Error('useAppPreferences must be used inside AppPreferencesProvider');
  }
  return context;
};
