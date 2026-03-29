import React, { createContext, useContext, useMemo, useState } from 'react';

interface AppSettingsContextType {
  governorate: string;
  setGovernorate: (value: string) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [governorate, setGovernorateState] = useState(() => localStorage.getItem('iraq-compass-governorate') || 'all');

  const setGovernorate = (value: string) => {
    setGovernorateState(value);
    localStorage.setItem('iraq-compass-governorate', value);
  };

  const value = useMemo(() => ({ governorate, setGovernorate }), [governorate]);

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) throw new Error('useAppSettings must be used inside AppSettingsProvider');
  return context;
};
