import { createClient } from '@supabase/supabase-js';
import type { TrialStatus } from '../types';

// Use Vite environment variables
const SUPABASE_URL = "https://otyxjcxxqwjotnuyrvmc.supabase.co";
// Fix: Cast `import.meta` to `any` to resolve TypeScript error when Vite client types are not recognized.
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fix: Cast `import.meta` to `any` to resolve TypeScript error when Vite client types are not recognized.
export const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'https://agendamento-ynxr.onrender.com';

// You would typically move the PremiumManager class here, 
// but given the complexity and its tight coupling with UI (modals),
// it's simpler to keep it within the component that uses it for this specific conversion.

export const fetchTrialStatus = async (token: string): Promise<TrialStatus> => {
    const res = await fetch(`${API_BASE_URL}/api/trial-status`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ msg: 'Failed to fetch trial status' }));
        throw new Error(errorData.msg || 'Failed to fetch trial status');
    }
    const data = await res.json();
    if (data.success) {
        return data.status;
    }
    throw new Error(data.msg || 'Could not get trial status');
};

export const fetchAppointments = async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/agendamentos`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
};

export const updateAppointmentStatus = async (token: string, userEmail: string, id: string, action: 'confirmar' | 'cancelar') => {
    const res = await fetch(`${API_BASE_URL}/agendamentos/${userEmail}/${action}/${id}`, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || `Failed to ${action} appointment`);
    }
    return res.json();
};

export const rescheduleAppointment = async (token: string, userEmail: string, id: string, novaData: string, novoHorario: string) => {
    const res = await fetch(`${API_BASE_URL}/agendamentos/${userEmail}/reagendar/${id}`, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ novaData, novoHorario })
    });
    if (!res.ok) {
         const errorData = await res.json();
        throw new Error(errorData.msg || 'Failed to reschedule');
    }
    return res.json();
};