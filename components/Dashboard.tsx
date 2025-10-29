import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { LogOut, Settings, Link as LinkIcon, Plus, User, Mail, Phone, Calendar, Clock, AlertTriangle } from 'react-feather';
import { apiService } from '../services/apiService';
import { Appointment, AppointmentStatus } from '../types';
import AppointmentList from './AppointmentList';
import AIFeatures from './AIFeatures';
import SettingsModal from './SettingsModal';
import ShareLinkModal from './ShareLinkModal';
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

const NoProfileModal: React.FC<{onClose: () => void, onCreateProfile: () => void}> = ({onClose, onCreateProfile}) => (
     <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1002] p-4">
        <div className="glass-card rounded-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 shadow-lg">
                    <User className="w-6 h-6 text-white" />
                </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">🏪 Perfil Necessário</h3>
            <p className="text-center text-gray-300 mb-4">Você precisa criar um perfil do estabelecimento antes de gerar links de agendamento.</p>
            <div className="flex gap-2 mt-6">
                <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-all text-white">
                    Fechar
                </button>
                <button onClick={onCreateProfile} className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 hover:opacity-90 transition-all text-white font-medium">
                    Criar Perfil
                </button>
            </div>
        </div>
    </div>
);


const Dashboard: React.FC = () => {
    const { user, session, logout } = useAuth();
    const { addToast } = useToast();
    const { register, handleSubmit, reset } = useForm<IFormInput>();
    
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // State for modals
    const [showSettings, setShowSettings] = useState(false);
    const [showNoProfileModal, setShowNoProfileModal] = useState(false);
    const [shareLinkInfo, setShareLinkInfo] = useState<{link: string; qr_code: string} | null>(null);

    // State for profile status
    const [profileExists, setProfileExists] = useState(false);

    const checkProfileStatus = useCallback(async () => {
      if (!session) return;
      try {
        const data = await apiService.getMyProfile(session.access_token);
        setProfileExists(data.success && !!data.perfil);
      } catch {
        setProfileExists(false);
      }
    }, [session]);

    const fetchAppointments = useCallback(async () => {
        if (!session) return;
        setLoading(true);
        try {
            const data = await apiService.getAppointments(session.access_token);
            setAppointments(data);
        } catch (error) {
            addToast('Erro ao carregar agendamentos', 'error');
        } finally {
            setLoading(false);
        }
    }, [session, addToast]);
    
    useEffect(() => {
        if (session) {
            fetchAppointments();
            checkProfileStatus();
        }
        
        const channel = supabase.channel(`public:agendamentos:user_id=eq.${user?.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'agendamentos' },
        (payload) => {
            fetchAppointments();
        })
        .subscribe();
        
        return () => {
            supabase.removeChannel(channel);
        };
    }, [session, user, fetchAppointments, checkProfileStatus]);

    const handleLogout = async () => {
        await logout();
        addToast('Logout realizado com sucesso', 'info');
    };

    const handleGenerateLink = async () => {
        if (!user || !session) return;
        try {
            const profileData = await apiService.getMyProfile(session.access_token);
            if (!profileData.success || !profileData.perfil) {
                setShowNoProfileModal(true);
                return;
            }

            const result = await apiService.generateShareLink(user.id, session.access_token);
            if(result.success && result.link){
                setShareLinkInfo({link: result.link, qr_code: result.qr_code});
            } else {
                 addToast(result.msg || "Erro desconhecido ao gerar link.", "error");
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
            addToast('Erro de conexão ao criar agendamento', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (id: number, status: AppointmentStatus) => {
        if (!session || status === 'pendente') return;
        try {
            await apiService.updateAppointmentStatus(id, status, session.access_token);
            addToast(`Agendamento ${status === 'confirmado' ? 'confirmado' : 'cancelado'}!`, 'success');
            fetchAppointments();
        } catch (error) {
            addToast('Erro ao atualizar status', 'error');
        }
    };

    const handleReschedule = async (id: number, newDate: string, newTime: string) => {
        if (!session) return;
        try {
            await apiService.rescheduleAppointment(id, newDate, newTime, session.access_token);
            addToast('Agendamento reagendado com sucesso!', 'success');
            fetchAppointments();
        } catch (error) {
            addToast('Erro ao reagendar', 'error');
        }
    };

    return (
        <>
            <header className="header-gradient text-center mb-8 md:mb-12" data-aos="fade-down">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-3">
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold title-gradient">Agendamento</h1>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={handleGenerateLink} className="text-xs sm:text-sm bg-black-light hover:bg-gray-steel px-3 py-2 rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto border border-black-light"><LinkIcon className="w-3 h-3 sm:w-4 sm:h-4" /> Gerar Link</button>
                        <button onClick={() => setShowSettings(true)} className="text-xs sm:text-sm bg-black-light hover:bg-gray-steel px-3 py-2 rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto border border-black-light">
                            <Settings className="w-3 h-3 sm:w-4 sm:h-4" /> Configurações {profileExists && <span className="ml-1 text-green-400 text-xs">✓</span>}
                        </button>
                        <button onClick={handleLogout} className="text-xs sm:text-sm bg-black-light hover:bg-gray-steel px-3 py-2 rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto border border-black-light"><LogOut className="w-3 h-3 sm:w-4 sm:h-4" /> Sair</button>
                    </div>
                </div>
                <p className="text-sm sm:text-lg text-white-ice max-w-2xl mx-auto px-2">
                    Gerencie seus compromissos com uma interface intuitiva e elegante
                </p>
            </header>

            <AIFeatures />
            
            <form onSubmit={handleSubmit(onFormSubmit)} className="glass-card rounded-2xl p-4 sm:p-6 md:p-8 mb-6 md:mb-8" data-aos="fade-up">
                 <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4 md:mb-6 title-gradient">Novo Agendamento</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 max-w-4xl mx-auto">
                    <div className="space-y-4 sm:space-y-5">
                        <div>
                            <label htmlFor="Nome" className="block mb-2 text-sm font-medium text-white-ice">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute inset-y-0 left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-steel" />
                                <input {...register("Nome", {required: true})} type="text" placeholder="Nome do cliente" className="w-full pl-10 pr-4 py-2 sm:py-3 rounded-lg bg-black-medium border border-black-light focus:outline-none input-field text-sm sm:text-base text-white"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="Email" className="block mb-2 text-sm font-medium text-white-ice">Email (opcional)</label>
                            <div className="relative">
                                <Mail className="absolute inset-y-0 left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-steel" />
                                <input {...register("Email")} type="email" placeholder="email@exemplo.com" className="w-full pl-10 pr-4 py-2 sm:py-3 rounded-lg bg-black-medium border border-black-light focus:outline-none input-field text-sm sm:text-base text-white"/>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 sm:space-y-5">
                         <div>
                            <label htmlFor="Telefone" className="block mb-2 text-sm font-medium text-white-ice">Telefone</label>
                            <div className="relative">
                                <Phone className="absolute inset-y-0 left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-steel" />
                                <IMaskInput
                                   mask="(00) 00000-0000"
                                   id="Telefone"
                                   placeholder="(00) 00000-0000"
                                   {...register('Telefone', { required: true })}
                                   className="w-full pl-10 pr-4 py-2 sm:py-3 rounded-lg bg-black-medium border border-black-light focus:outline-none input-field text-sm sm:text-base text-white"
                               />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label htmlFor="Data" className="block mb-2 text-sm font-medium text-white-ice">Data</label>
                                <div className="relative">
                                    <Calendar className="absolute inset-y-0 left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-steel" />
                                    <input {...register("Data", {required: true})} type="date" className="w-full pl-10 pr-4 py-2 sm:py-3 rounded-lg bg-black-medium border border-black-light focus:outline-none input-field text-sm sm:text-base text-white dark-picker"/>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="Horario" className="block mb-2 text-sm font-medium text-white-ice">Horário</label>
                                <div className="relative">
                                    <Clock className="absolute inset-y-0 left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-steel" />
                                    <input {...register("Horario", {required: true})} type="time" className="w-full pl-10 pr-4 py-2 sm:py-3 rounded-lg bg-black-medium border border-black-light focus:outline-none input-field text-sm sm:text-base text-white dark-picker"/>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
                 <div className="max-w-md mx-auto mt-6 md:mt-8">
                     <button type="submit" disabled={isSubmitting} className="btn-premium w-full">
                         {isSubmitting ? <div className="loading-spinner-premium"></div> : <Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
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

            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onSaveSuccess={checkProfileStatus} />}
            {shareLinkInfo && <ShareLinkModal link={shareLinkInfo.link} qrCodeUrl={shareLinkInfo.qr_code} onClose={() => setShareLinkInfo(null)} />}
            {showNoProfileModal && <NoProfileModal onClose={() => setShowNoProfileModal(false)} onCreateProfile={() => { setShowNoProfileModal(false); setShowSettings(true); }} />}
        </>
    );
};

export default Dashboard;