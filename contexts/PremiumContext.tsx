import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../services/apiService';

interface TrialStatus {
  hasTrial: boolean;
  isPremium: boolean;
  dailyUsagesLeft: number;
  dailyLimit: number;
}

interface PremiumContextType {
  status: TrialStatus;
  loading: boolean;
  checkUsage: () => boolean;
  refreshStatus: () => void;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

const initialState: TrialStatus = {
    hasTrial: false,
    isPremium: false,
    dailyUsagesLeft: 0,
    dailyLimit: 5,
};

export const PremiumProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [status, setStatus] = useState<TrialStatus>(initialState);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!session) {
      setStatus(initialState);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiService.getTrialStatus(session.access_token);
      if (data.success) {
        setStatus({
          hasTrial: data.hasTrial,
          isPremium: data.isPremium,
          dailyUsagesLeft: data.dailyUsagesLeft,
          dailyLimit: data.dailyLimit,
        });
      }
    } catch (error) {
      console.error("Failed to fetch trial status:", error);
      setStatus(initialState);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const checkUsage = () => {
    if (status.isPremium) return true;
    if (status.hasTrial && status.dailyUsagesLeft > 0) return true;
    return false;
  };
  
  const value = {
    status,
    loading,
    checkUsage,
    refreshStatus: fetchStatus
  };

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};
