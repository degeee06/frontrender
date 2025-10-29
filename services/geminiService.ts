
const API_BASE_URL = 'https://agendamento-ynxr.onrender.com';

export const geminiService = {
  suggestTimes: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/sugerir-horarios`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get suggestions');
    return response.json();
  },

  getStatistics: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/estatisticas-pessoais`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get statistics');
    return response.json();
  },
};
