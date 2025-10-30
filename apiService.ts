import { Appointment, UserProfile } from '../types';

const API_BASE_URL = 'https://agendamento-ynxr.onrender.com';

export const apiService = {
  // Public scheduling page calls
  getPublicProfile: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/perfil-publico/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  getAvailableTimes: async (userId: string, date: string) => {
    const response = await fetch(`${API_BASE_URL}/api/horarios-disponiveis/${userId}?data=${date}`);
    if (!response.ok) throw new Error('Failed to fetch available times');
    return response.json();
  },

  submitPublicAppointment: async (appointmentData: {
    nome: string;
    email: string;
    telefone: string;
    data: string;
    horario: string;
    user_id: string;
    t: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/agendamento-publico`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData),
    });
    return response.json();
  },

  // Dashboard calls (authenticated)
  getAppointments: async (token: string): Promise<Appointment[]> => {
    const response = await fetch(`${API_BASE_URL}/agendamentos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch appointments');
    const data = await response.json();
    return data.agendamentos;
  },

  createAppointment: async (appointmentData: Omit<Appointment, 'id' | 'status' | 'user_id'>, token: string) => {
    const response = await fetch(`${API_BASE_URL}/agendar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
    });
    return response.json();
  },
  
  updateAppointmentStatus: async (id: number, status: 'confirmado' | 'cancelado', token: string) => {
    const { data: { user } } = await import('./supabase').then(m => m.supabase.auth.getUser());
    if (!user || !user.email) throw new Error('User not found');
    
    const endpoint = status === 'confirmado' ? 'confirmar' : 'cancelar';
    const res = await fetch(`${API_BASE_URL}/agendamentos/${user.email}/${endpoint}/${id}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
    });
    if(!res.ok) throw new Error(`Failed to ${endpoint} appointment`);
    return res.json();
  },

  rescheduleAppointment: async (id: number, novaData: string, novoHorario: string, token: string) => {
    const { data: { user } } = await import('./supabase').then(m => m.supabase.auth.getUser());
    if (!user || !user.email) throw new Error('User not found');
    
    const res = await fetch(`${API_BASE_URL}/agendamentos/${user.email}/reagendar/${id}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ novaData, novoHorario })
    });
    if(!res.ok) throw new Error('Failed to reschedule appointment');
    return res.json();
  },

  generateShareLink: async (userId: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/gerar-link/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to generate link');
    return response.json();
  },
  
  saveProfile: async (profileData: UserProfile, token: string) => {
     const response = await fetch(`${API_BASE_URL}/api/criar-perfil`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
    });
    if (!response.ok) throw new Error('Failed to save profile');
    return response.json();
  },

  getMyProfile: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/meu-perfil`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        if (response.status === 404) return { success: false, perfil: null };
        throw new Error('Failed to get profile');
    }
    return response.json();
  },

  getTrialStatus: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/trial-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to get trial status');
    return response.json();
  }
};