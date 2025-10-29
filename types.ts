
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface Appointment {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  telefone: string;
  data: string;
  horario: string;
  status: 'pendente' | 'confirmado' | 'cancelado';
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  nome_negocio: string;
  tipo_negocio: string;
  dias_funcionamento: string[];
  horarios_funcionamento: Record<string, { inicio: string; fim: string }>;
  horarios_bloqueados: BlockedPeriod[];
}

export interface BlockedPeriod {
  tipo: 'recorrente' | 'data_especifica';
  inicio: string;
  fim: string;
  data?: string;
}

export interface User extends SupabaseUser {}

export interface TrialStatus {
    hasTrial: boolean;
    isPremiumTrial?: boolean;
    isFreeTrial?: boolean;
    dailyUsagesLeft: number;
    unlimited?: boolean;
}

export interface Statistics {
    total: number;
    este_mes: number;
    confirmados: number;
    taxa_comparecimento: string;
}

export interface DashboardProps {
    session: Session;
}
