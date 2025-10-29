
export interface Appointment {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  data: string;
  horario: string;
  status: 'pendente' | 'confirmado' | 'cancelado';
  user_id: string;
}

export type AppointmentStatus = 'pendente' | 'confirmado' | 'cancelado';

export interface BlockedPeriod {
    tipo: 'recorrente' | 'data_especifica';
    inicio: string;
    fim: string;
    data?: string;
}

export interface UserProfile {
    id?: string;
    nome_negocio: string;
    tipo_negocio: string;
    dias_funcionamento: string[];
    horarios_funcionamento: {
        [key: string]: {
            inicio: string;
            fim: string;
        }
    };
    horarios_bloqueados: BlockedPeriod[];
}
