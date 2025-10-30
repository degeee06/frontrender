import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';

// This is a direct port of the logic from the original index.html PremiumManager

interface TrialStatus {
  hasTrial: boolean;
  isPremium: boolean;
  dailyUsagesLeft: number;
  dailyLimit: number;
}

interface PremiumContextType {
  status: TrialStatus;
  loading: boolean;
  checkUsage: () => Promise<boolean>; // Made async to be more robust
  refreshStatus: () => void;
  startTrial: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

const initialState: TrialStatus = {
    hasTrial: false,
    isPremium: false,
    dailyUsagesLeft: 0,
    dailyLimit: 5,
};

// Helper function to get user trial data from Supabase
const getUserTrial = async (userId: string) => {
    const { data, error } = await supabase
        .from('user_trials')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
};

// Helper function to get user subscription data from Supabase
const getUserSubscription = async (userEmail: string) => {
    const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_email', userEmail)
        .eq('status', 'active')
        .gte('ends_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
};

export const PremiumProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, session } = useAuth();
  const [status, setStatus] = useState<TrialStatus>(initialState);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!user || !session) {
      setStatus(initialState);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
        const subscription = await getUserSubscription(user.email!);
        if (subscription) {
            setStatus({ hasTrial: true, isPremium: true, dailyUsagesLeft: 999, dailyLimit: 999 });
            return;
        }

        const trial = await getUserTrial(user.id);
        if (!trial || trial.status !== 'active') {
             setStatus({ ...initialState, hasTrial: false });
             return;
        }
        
        // Logic to reset daily usage count
        const today = new Date().toISOString().split('T')[0];
        const lastUsageDate = trial.last_usage_date ? new Date(trial.last_usage_date).toISOString().split('T')[0] : null;
        let dailyUsageCount = trial.daily_usage_count || 0;

        if(lastUsageDate !== today) {
            dailyUsageCount = 0;
            await supabase.from('user_trials').update({ daily_usage_count: 0, last_usage_date: today }).eq('id', trial.id);
        }
        
        const dailyLimit = 5; // Free plan limit
        const dailyUsagesLeft = Math.max(0, dailyLimit - dailyUsageCount);

        setStatus({ hasTrial: true, isPremium: false, dailyUsagesLeft, dailyLimit });

    } catch (error) {
      console.error("Failed to fetch trial status:", error);
      setStatus(initialState);
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  const startTrial = useCallback(async () => {
    if (!user || !session) return;
    
    const existingTrial = await getUserTrial(user.id);
    if (existingTrial) return;

    try {
        await supabase.from('user_trials').insert([{ 
            user_id: user.id,
            user_email: user.email,
            status: 'active',
            usage_count: 0,
            daily_usage_count: 0,
            max_usages: 5
        }]);
        await fetchStatus(); // Refresh status after creating trial
    } catch(error) {
        console.error("Error starting trial:", error);
    }
  }, [user, session, fetchStatus]);
  

  useEffect(() => {
    if(session) {
        startTrial().then(() => {
            fetchStatus();
        });
    } else {
        setStatus(initialState);
    }
  }, [session, startTrial, fetchStatus]);


  const checkUsage = async (): Promise<boolean> => {
    await fetchStatus(); // Always get the latest status
    
    if (status.isPremium) return true;
    if (status.hasTrial && status.dailyUsagesLeft > 0) return true;

    return false;
  };
  
  const value = {
    status,
    loading,
    checkUsage,
    refreshStatus: fetchStatus,
    startTrial
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
