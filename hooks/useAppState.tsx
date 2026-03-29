import React, { createContext, useContext, useMemo, useState } from 'react';

type AppState = {
  governorate: string;
  setGovernorate: (governorate: string) => void;
};

const AppStateContext = createContext<AppState | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [governorate, setGovernorateState] = useState(() => localStorage.getItem('iraq-compass-governorate') || 'all');

  const setGovernorate = (nextGovernorate: string) => {
    setGovernorateState(nextGovernorate);
    localStorage.setItem('iraq-compass-governorate', nextGovernorate);
  };

  const value = useMemo(() => ({ governorate, setGovernorate }), [governorate]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};
