
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, API_BASE_URL, fetchTrialStatus } from '../services/api';
import type { Appointment, DashboardProps, Profile, TrialStatus, Statistics, BlockedPeriod } from '../types';
import { showToast } from './shared/Toast';

// Forward declaration for jsPDF
declare const jspdf: any;
declare const IMask: any;

// Helper sub-components defined outside the main component to prevent re-renders.
const Icon: React.FC<{ name: string; className?: string }> = ({ name, className }) => (
    <i data-feather={name} className={className}></i>
);

const PremiumBadge: React.FC<{ trialStatus: TrialStatus | null }> = ({ trialStatus }) => {
    if (!trialStatus) return null;

    if (trialStatus.unlimited) {
        return <div className="hidden sm:flex premium-badge bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1.5 rounded-lg items-center gap-2">🚀 Premium</div>;
    }

    if (trialStatus.hasTrial) {
        const total = trialStatus.isPremiumTrial ? 15 : 5;
        const used = total - trialStatus.dailyUsagesLeft;
        
        let colorClass = 'from-green-500 to-emerald-500';
        if (trialStatus.dailyUsagesLeft <= 0) colorClass = 'from-red-500 to-rose-600';
        else if (trialStatus.dailyUsagesLeft <= 2) colorClass = 'from-yellow-500 to-amber-600';

        return <div className={`hidden sm:flex premium-badge bg-gradient-to-r ${colorClass} text-white text-xs px-3 py-1.5 rounded-lg items-center gap-2`}>🎯 {used}/{total}</div>;
    }

    return null;
};


const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: () => void; session: DashboardProps['session'] }> = ({ isOpen, onClose, onSave, session }) => {
    const [profile, setProfile] = useState<Partial<Profile>>({});
    const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);

    const loadProfile = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/meu-perfil`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.perfil) {
                    setProfile(data.perfil);
                    setBlockedPeriods(data.perfil.horarios_bloqueados || []);
                }
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        }
    }, [session.access_token]);

    useEffect(() => {
        if (isOpen) {
            loadProfile();
        }
    }, [isOpen, loadProfile]);

    const handleSave = async () => {
        // Saving logic here...
        showToast("Perfil salvo com sucesso!", "success");
        onSave();
        onClose();
    };
    
    const addBlockedPeriod = () => {
        const newPeriod: BlockedPeriod = {
            tipo: 'recorrente',
            inicio: '12:00',
            fim: '14:00'
        };
        setBlockedPeriods([...blockedPeriods, newPeriod]);
    };
    
    const removeBlockedPeriod = (index: number) => {
        setBlockedPeriods(blockedPeriods.filter((_, i) => i !== index));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1A] border border-[#333333] shadow-[0_8px_40px_rgba(0,0,0,0.5)] rounded-2xl p-4 sm:p-6 w-full max-w-md sm:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide" data-aos="fade-up" data-aos-once="false">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">🏪 Perfil do Negócio</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1"><Icon name="x" className="w-5 h-5" /></button>
                </div>
                
                <div className="space-y-4 md:space-y-6">
                    {/* Business Name and Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Negócio</label>
                            <input type="text" placeholder="Ex: Barbearia do João" className="w-full px-3 py-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white focus:outline-none focus:border-[#C0C0C0]"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Tipo de Negócio</label>
                            <select className="w-full px-3 py-2.5 rounded-lg bg-[#111111] border border-[#333333] text-white focus:outline-none focus:border-[#C0C0C0]">
                                <option value="barbearia">💈 Barbearia</option>
                                <option value="consultorio">🏥 Consultório</option>
                                <option value="salao">💇 Salão de Beleza</option>
                                <option value="outros">🏢 Outros</option>
                            </select>
                        </div>
                    </div>

                    {/* Operating Days */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">📅 Dias de Funcionamento</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].map(dia => (
                                <label key={dia} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer">
                                    <input type="checkbox" className="rounded bg-white/10 border-white/20 w-4 h-4 text-[#C0C0C0] focus:ring-[#C0C0C0]"/>
                                    <span className="capitalize text-sm">{dia.substring(0,3)}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Blocked Periods */}
                    <div className="border-t border-white/10 pt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <h4 className="text-base font-semibold">🚫 Bloquear Períodos</h4>
                            <button onClick={addBlockedPeriod} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all text-sm w-full sm:w-auto">+ Adicionar</button>
                        </div>
                        <div id="listaPeriodosBloqueados" className="space-y-3 max-h-40 overflow-y-auto pr-2">
                           {blockedPeriods.length === 0 ? <p className="text-center text-sm text-gray-500 py-4">Nenhum período bloqueado.</p> :
                            blockedPeriods.map((period, index) => (
                                <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10 flex flex-col sm:flex-row items-center gap-3">
                                    <div className="grid grid-cols-2 gap-3 flex-1 w-full">
                                        <input type="time" defaultValue={period.inicio} className="w-full px-2 py-1.5 rounded bg-black/50 border border-white/20 text-white text-sm" />
                                        <input type="time" defaultValue={period.fim} className="w-full px-2 py-1.5 rounded bg-black/50 border border-white/20 text-white text-sm" />
                                    </div>
                                    <button onClick={() => removeBlockedPeriod(index)} className="p-2 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all">
                                        <Icon name="trash-2" className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button onClick={onClose} className="w-full sm:w-auto flex-1 order-2 sm:order-1 px-4 py-3 rounded-lg bg-[#333333] hover:bg-[#5A5A5A] transition-all text-white">Cancelar</button>
                    <button onClick={handleSave} className="w-full sm:w-auto flex-1 order-1 sm:order-2 px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 hover:opacity-90 transition-all text-white font-medium flex items-center justify-center gap-2">
                        <Icon name="save" className="w-4 h-4" /> Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};


// Main Dashboard Component
const Dashboard: React.FC<DashboardProps> = ({ session }) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [activeDay, setActiveDay] = useState<number>(new Date().getDay());
    const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const phoneInputRef = useRef<HTMLInputElement>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);
    const timeInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (phoneInputRef.current) {
            IMask(phoneInputRef.current, { mask: '(00) 00000-0000' });
        }
    }, []);

    const handleLogout = async () => {
        showToast("Saindo...", "info");
        await supabase.auth.signOut();
        // The onAuthStateChange in App.tsx will handle the rest.
    };

    const fetchAndSetAppointments = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/agendamentos`, {
                headers: { "Authorization": `Bearer ${session.access_token}` }
            });
            if (!response.ok) {
                 if(response.status === 401) handleLogout();
                 throw new Error('Failed to fetch');
            }
            const data = await response.json();
            setAppointments(data.agendamentos || []);
        } catch (error) {
            console.error("Error fetching appointments:", error);
            showToast("Erro ao carregar agendamentos", "error");
        } finally {
            setLoading(false);
        }
    }, [session.access_token]);

    useEffect(() => {
        fetchAndSetAppointments();

        const getTrialStatus = async () => {
            try {
                const status = await fetchTrialStatus(session.access_token);
                setTrialStatus(status);
            } catch (error) {
                console.error("Failed to fetch trial status:", error);
                // Silently fail, or show a non-intrusive message
            }
        };
        getTrialStatus();

        const sub = supabase.channel('custom-all-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'agendamentos' }, (payload) => {
                console.log('Change received!', payload);
                fetchAndSetAppointments();
            })
            .subscribe();
        
        return () => {
            supabase.removeChannel(sub);
        }
    }, [fetchAndSetAppointments, session.access_token]);

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const filtered = appointments.filter(a => {
            const nameMatch = a.nome.toLowerCase().includes(searchQuery.toLowerCase());
            const statusMatch = statusFilter ? a.status === statusFilter : true;
            
            const appointmentDate = new Date(a.data + 'T00:00:00'); // Adjust for timezone
            const dayMatch = appointmentDate.getDay() === activeDay && appointmentDate >= today;
           
            // Note: Weekly filters are simplified here. A full implementation would need more date logic.
            const weeklyMatch = activeDay < 0 ? true : dayMatch;

            return nameMatch && statusMatch && weeklyMatch;
        }).sort((a, b) => new Date(a.data + 'T' + a.horario).getTime() - new Date(b.data + 'T' + b.horario).getTime());
        
        setFilteredAppointments(filtered);
    }, [appointments, searchQuery, statusFilter, activeDay]);
    
    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${API_BASE_URL}/agendar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${session.access_token}` },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.msg || "Erro ao agendar");
            
            showToast("Agendado com sucesso!", "success");
            formRef.current?.reset();
            fetchAndSetAppointments(); // Refresh list
        } catch (error: any) {
            showToast(error.message, "error");
        }
    };
    
    // Placeholder for AI and other complex features
    const suggestSlots = () => showToast("Função IA: Sugerir horários em breve!", "info");
    const getStats = () => showToast("Função IA: Estatísticas em breve!", "info");
    const generateLink = () => showToast("Link de agendamento em breve!", "info");
    const openSettings = () => setIsProfileModalOpen(true);
    const exportCSV = () => showToast("Exportar para CSV em breve!", "info");
    const exportPDF = () => {
        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        doc.text("Relatório de Agendamentos", 10, 10);
        // Add more content here from filteredAppointments
        doc.save("agendamentos.pdf");
        showToast("Exportando para PDF...", "success");
    };

    return (
        <>
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <header className="bg-[#1A1A1A] border border-[#333333] text-center mb-8 md:mb-12 rounded-2xl p-6 relative overflow-hidden" data-aos="fade-down">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C0C0C0] to-transparent opacity-30"></div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-3">
                        <div className="flex items-center justify-center gap-4">
                            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-[#E0E0E0] bg-clip-text text-transparent">Agendamento</h1>
                            <PremiumBadge trialStatus={trialStatus} />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto justify-center">
                            <button onClick={generateLink} className="text-xs sm:text-sm bg-[#333333] hover:bg-[#5A5A5A] px-3 py-2 rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto border border-[#333333] transition-colors"><Icon name="link" className="w-4 h-4" /> Gerar Link</button>
                            <button onClick={openSettings} className="text-xs sm:text-sm bg-[#333333] hover:bg-[#5A5A5A] px-3 py-2 rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto border border-[#333333] transition-colors"><Icon name="settings" className="w-4 h-4" /> Configs</button>
                            <button onClick={handleLogout} className="text-xs sm:text-sm bg-[#333333] hover:bg-[#5A5A5A] px-3 py-2 rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto border border-[#333333] transition-colors"><Icon name="log-out" className="w-4 h-4" /> Sair</button>
                        </div>
                    </div>
                    <p className="text-sm sm:text-lg text-[#E0E0E0] max-w-2xl mx-auto px-2">Gerencie seus compromissos com uma interface intuitiva e elegante</p>
                </header>

                {/* AI Sections */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-6" data-aos="fade-up">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 bg-gradient-to-r from-white to-[#E0E0E0] bg-clip-text text-transparent"><span>🎯</span> Sugerir Horários Livres</h3>
                      <button onClick={suggestSlots} className="w-full px-4 py-3 rounded-lg bg-[#333333] hover:bg-[#5A5A5A] text-white font-medium transition-all flex items-center justify-center gap-2 border border-[#333333]"><span>📅</span> Encontrar Melhores Horários</button>
                  </div>
                  <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-6" data-aos="fade-up">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 bg-gradient-to-r from-white to-[#E0E0E0] bg-clip-text text-transparent"><span>📊</span> Análise e Estatísticas</h3>
                      <button onClick={getStats} className="w-full px-4 py-3 rounded-lg bg-[#333333] hover:bg-[#5A5A5A] text-white font-medium transition-all flex items-center justify-center gap-2 border border-[#333333]"><span>📈</span> Ver Estatísticas Detalhadas</button>
                  </div>
                </div>

                {/* Appointment Form */}
                <form ref={formRef} onSubmit={handleFormSubmit} className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-4 sm:p-6 md:p-8 mb-6 md:mb-8" data-aos="fade-up">
                     <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4 md:mb-6 bg-gradient-to-r from-white to-[#E0E0E0] bg-clip-text text-transparent">Novo Agendamento</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
                        {/* Fields here */}
                         <div>
                            <label htmlFor="Nome" className="block mb-2 text-sm font-medium text-[#E0E0E0]">Nome Completo</label>
                            <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon name="user" className="w-5 h-5 text-[#5A5A5A]" /></div><input type="text" name="Nome" placeholder="Seu nome" required className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#111111] border border-[#333333] focus:outline-none focus:border-[#C0C0C0] text-base"/></div>
                        </div>
                        <div>
                            <label htmlFor="Email" className="block mb-2 text-sm font-medium text-[#E0E0E0]">Email</label>
                             <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon name="mail" className="w-5 h-5 text-[#5A5A5A]" /></div><input type="email" name="Email" placeholder="Email (opcional)" className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#111111] border border-[#333333] focus:outline-none focus:border-[#C0C0C0] text-base"/></div>
                        </div>
                         <div>
                            <label htmlFor="Telefone" className="block mb-2 text-sm font-medium text-[#E0E0E0]">Telefone</label>
                            <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon name="phone" className="w-5 h-5 text-[#5A5A5A]" /></div><input ref={phoneInputRef} type="tel" id="Telefone" name="Telefone" placeholder="(00) 00000-0000" required className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#111111] border border-[#333333] focus:outline-none focus:border-[#C0C0C0]"/></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                 <label htmlFor="Data" className="block mb-2 text-sm font-medium text-[#E0E0E0]">Data</label>
                                 <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon name="calendar" className="w-5 h-5 text-[#5A5A5A]" /></div><input ref={dateInputRef} type="date" name="Data" required className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#111111] border border-[#333333] focus:outline-none focus:border-[#C0C0C0]"/></div>
                            </div>
                            <div>
                                <label htmlFor="Horario" className="block mb-2 text-sm font-medium text-[#E0E0E0]">Horário</label>
                                 <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon name="clock" className="w-5 h-5 text-[#5A5A5A]" /></div><input ref={timeInputRef} type="time" name="Horario" required className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#111111] border border-[#333333] focus:outline-none focus:border-[#C0C0C0]"/></div>
                            </div>
                        </div>
                     </div>
                     <div className="max-w-md mx-auto mt-8">
                         <button type="submit" className="w-full flex items-center justify-center gap-3 py-4 px-8 rounded-xl font-semibold text-black bg-gradient-to-r from-[#C0C0C0] to-[#9E9E9E] border border-[#E0E0E0] shadow-[0_4px_12px_rgba(192,192,192,0.3)] hover:from-[#E0E0E0] hover:to-[#C0C0C0] hover:-translate-y-0.5 transition-all"><Icon name="plus" className="w-5 h-5" /> Agendar</button>
                     </div>
                </form>
                
                {/* Filters */}
                <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-6 mb-6" data-aos="fade-up">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon name="search" className="w-5 h-5 text-[#5A5A5A]" /></div><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Pesquisar..." className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#111111] border border-[#333333] focus:outline-none focus:border-[#C0C0C0]"/></div>
                        <div className="relative w-full md:w-48"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon name="filter" className="w-5 h-5 text-[#5A5A5A]" /></div><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full appearance-none pl-10 pr-4 py-3 rounded-lg bg-[#111111] border border-[#333333] text-[#E0E0E0] focus:outline-none focus:border-[#C0C0C0]"><option value="">Todos</option><option value="pendente">Pendente</option><option value="confirmado">Confirmado</option><option value="cancelado">Cancelado</option></select></div>
                        <div className="flex gap-2 w-full md:w-auto"><button onClick={exportCSV} className="w-full md:w-auto px-4 py-3 rounded-lg bg-[#111111] border border-[#333333] hover:bg-[#333333] transition-all flex items-center justify-center gap-2"><Icon name="download" className="w-5 h-5" /> <span className="hidden md:inline">CSV</span></button><button onClick={exportPDF} className="w-full md:w-auto px-4 py-3 rounded-lg bg-[#111111] border border-[#333333] hover:bg-[#333333] transition-all flex items-center justify-center gap-2"><Icon name="file-text" className="w-5 h-5" /> <span className="hidden md:inline">PDF</span></button></div>
                    </div>
                </div>
                
                {/* Day Tabs */}
                <div className="flex justify-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                        <button key={day} onClick={() => setActiveDay(index)} className={`px-5 py-2.5 rounded-xl transition-all font-medium whitespace-nowrap ${activeDay === index ? 'bg-gradient-to-r from-[#C0C0C0] to-[#9E9E9E] text-black shadow-md' : 'bg-[#1A1A1A] hover:bg-[#333333]'}`}>{day}</button>
                    ))}
                </div>

                {/* Appointment List */}
                <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-6 max-h-[500px] overflow-y-auto" data-aos="fade-up">
                    {loading ? <p>Carregando...</p> : filteredAppointments.length === 0 ? <p className="text-center text-[#5A5A5A] py-8">Nenhum agendamento encontrado.</p> :
                        <div className="space-y-4">
                            {filteredAppointments.map(app => (
                                <div key={app.id} className="bg-[#111111] border border-[#333333] rounded-xl p-5 hover:border-[#5A5A5A] transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-semibold">{app.nome}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${app.status === 'confirmado' ? 'bg-green-900/50 text-green-300' : app.status === 'pendente' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-red-900/50 text-red-300'}`}>{app.status}</span>
                                    </div>
                                    <p className="text-sm text-[#E0E0E0]">{new Date(app.data + 'T' + app.horario).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} às {app.horario}</p>
                                    <p className="text-sm text-[#5A5A5A]">{app.telefone}</p>
                                </div>
                            ))}
                        </div>
                    }
                </div>
            </div>
            <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} onSave={() => console.log("Profile Saved!")} session={session} />
        </>
    );
};

export default Dashboard;
