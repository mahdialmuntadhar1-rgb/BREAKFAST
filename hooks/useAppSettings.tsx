import React, { createContext, useContext, useMemo, useState } from 'react';

interface AppSettingsContextType {
  selectedGovernorate: string;
  setSelectedGovernorate: (value: string) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedGovernorate, setSelectedGovernorateState] = useState(() => localStorage.getItem('iraq-compass-governorate') || 'all');

  const setSelectedGovernorate = (value: string) => {
    setSelectedGovernorateState(value);
    localStorage.setItem('iraq-compass-governorate', value);
  };

  const value = useMemo(() => ({ selectedGovernorate, setSelectedGovernorate }), [selectedGovernorate]);

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) throw new Error('useAppSettings must be used within AppSettingsProvider');
  return context;
};
