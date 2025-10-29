
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { LogOut, Settings, Link as LinkIcon, Plus, User, Mail, Phone, Calendar, Clock } from 'react-feather';
import { apiService } from '../services/apiService';
import { Appointment, AppointmentStatus } from '../types';
import AppointmentList from './AppointmentList';
import AIFeatures from './AIFeatures';
import SettingsModal from './SettingsModal';
import { IMaskInput } from 'react-imask';
import { useForm, SubmitHandler } from 'react-hook-form';
import Loader from './Loader';
import { supabase } from '../services/supabase';

interface IFormInput {
    Nome: string;
    Email: string;
    Telefone: string;
    Data: string;
    Horario: string;
}

const Dashboard: React.FC = () => {
    const { user, session, logout } = useAuth();
    const { addToast } = useToast();
    const { register, handleSubmit, reset } = useForm<IFormInput>();
    
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    
    const fetchAppointments = async () => {
        if (!session) return;
        try {
            const data = await apiService.getAppointments(session.access_token);
            setAppointments(data);
        } catch (error) {
            addToast('Erro ao carregar agendamentos', 'error');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchAppointments();
        
        const channel = supabase.channel(`public:agendamentos:user_id=eq.${user?.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'agendamentos' },
        () => {
            fetchAppointments();
        })
        .subscribe();
        
        return () => {
            supabase.removeChannel(channel);
        };
    }, [session, user]);

    const handleLogout = async () => {
        await logout();
        addToast('Logout realizado com sucesso', 'info');
    };

    const handleGenerateLink = async () => {
        if (!user || !session) return;
        try {
            const result = await apiService.generateShareLink(user.id, session.access_token);
            if(result.link){
                navigator.clipboard.writeText(result.link);
                addToast("Link de agendamento copiado!", "success");
            } else {
                 addToast(result.msg || "Crie um perfil antes de gerar o link", "error");
                 setShowSettings(true);
            }
        } catch (error) {
            addToast("Erro ao gerar link", "error");
        }
    };

    const onFormSubmit: SubmitHandler<IFormInput> = async (data) => {
        if (!session) return;
        setIsSubmitting(true);
        try {
            const appointmentData = {
                nome: data.Nome,
                email: data.Email || 'Não informado',
                telefone: data.Telefone,
                data: data.Data,
                horario: data.Horario,
            };
            const result = await apiService.createAppointment(appointmentData, session.access_token);
            if (result.success) {
                addToast('Agendamento criado com sucesso!', 'success');
                reset();
                fetchAppointments();
            } else {
                addToast(result.msg || 'Erro ao criar agendamento', 'error');
            }
        } catch (error) {
            addToast('Erro de conexão', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (id: number, status: AppointmentStatus) => {
        if (!session || status === 'pendente') return;
        try {
            await apiService.updateAppointmentStatus(id, status, session.access_token);
            addToast(`Agendamento ${status}!`, 'success');
            fetchAppointments();
        } catch (error) {
            addToast('Erro ao atualizar status', 'error');
        }
    };

    const handleReschedule = async (id: number, newDate: string, newTime: string) => {
        if (!session) return;
        try {
            await apiService.rescheduleAppointment(id, newDate, newTime, session.access_token);
            addToast('Agendamento reagendado!', 'success');
            fetchAppointments();
        } catch (error) {
            addToast('Erro ao reagendar', 'error');
        }
    };

    return (
        <>
            <header className="dashboard-header glass-card p-6" data-aos="fade-down">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold title-gradient">Dashboard</h1>
                    <p className="text-sm sm:text-base text-white-ice opacity-80">
                        Gerencie seus compromissos.
                    </p>
                </div>
                <div className="dashboard-header-actions">
                    <button onClick={handleGenerateLink} className="btn btn-secondary flex-1"><LinkIcon size={16} /> Link</button>
                    <button onClick={() => setShowSettings(true)} className="btn btn-secondary flex-1"><Settings size={16} /> Ajustes</button>
                    <button onClick={handleLogout} className="btn btn-secondary flex-1"><LogOut size={16} /> Sair</button>
                </div>
            </header>

            <AIFeatures />
            
            <form onSubmit={handleSubmit(onFormSubmit)} className="glass-card p-6 md:p-8 mb-6" data-aos="fade-up">
                 <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6 title-gradient">Novo Agendamento</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    <div className="space-y-4">
                        <div className="form-input-group">
                            <User className="form-input-icon" size={20} />
                            <input {...register("Nome", {required: true})} type="text" placeholder="Nome do cliente" className="form-input"/>
                        </div>
                        <div className="form-input-group">
                            <Mail className="form-input-icon" size={20} />
                            <input {...register("Email")} type="email" placeholder="Email (opcional)" className="form-input"/>
                        </div>
                    </div>
                    <div className="space-y-4">
                         <div className="form-input-group">
                            <Phone className="form-input-icon" size={20} />
                            <IMaskInput
                               mask="(00) 00000-0000"
                               placeholder="(00) 00000-0000"
                               {...register('Telefone', { required: true })}
                               className="form-input"
                           />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="form-input-group">
                                <Calendar className="form-input-icon" size={20} />
                                <input {...register("Data", {required: true})} type="date" className="form-input"/>
                            </div>
                            <div className="form-input-group">
                                <Clock className="form-input-icon" size={20} />
                                <input {...register("Horario", {required: true})} type="time" className="form-input"/>
                            </div>
                        </div>
                    </div>
                 </div>
                 <div className="max-w-md mx-auto mt-6">
                     <button type="submit" disabled={isSubmitting} className="btn btn-premium w-full">
                         {isSubmitting ? <div className="loading-spinner-premium"></div> : <Plus size={20} />}
                         <span>{isSubmitting ? 'Agendando...' : 'Agendar'}</span>
                     </button>
                 </div>
            </form>

            <AppointmentList
                appointments={appointments}
                loading={loading}
                onStatusChange={handleStatusChange}
                onReschedule={handleReschedule}
             />

            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        </>
    );
};

export default Dashboard;
