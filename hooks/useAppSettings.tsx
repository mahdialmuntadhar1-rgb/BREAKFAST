import React, { createContext, useContext, useMemo, useState } from 'react';

type AppSettingsContextType = {
  selectedGovernorate: string;
  setSelectedGovernorate: (value: string) => void;
};

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedGovernorate, setSelectedGovernorateState] = useState(() => {
    if (typeof window === 'undefined') return 'all';
    return localStorage.getItem('iraq-compass-governorate') || 'all';
  });

  const setSelectedGovernorate = (value: string) => {
    setSelectedGovernorateState(value);
    localStorage.setItem('iraq-compass-governorate', value);
  };

  const value = useMemo(() => ({ selectedGovernorate, setSelectedGovernorate }), [selectedGovernorate]);
  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
};

export const useAppSettings = () => {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used within AppSettingsProvider');
  return ctx;
};
