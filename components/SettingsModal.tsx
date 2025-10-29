import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { apiService } from '../services/apiService';
import { UserProfile, BlockedPeriod } from '../types';
import { X, Save, Plus, Trash2, Star, CheckCircle, AlertTriangle } from 'react-feather';
import Loader from './Loader';

interface SettingsModalProps {
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const { user, session } = useAuth();
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile>({
        nome_negocio: '',
        tipo_negocio: 'barbearia',
        dias_funcionamento: [],
        horarios_funcionamento: {},
        horarios_bloqueados: [],
    });
    const [openingTime, setOpeningTime] = useState('08:00');
    const [closingTime, setClosingTime] = useState('18:00');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!session) return;
            try {
                const data = await apiService.getMyProfile(session.access_token);
                if (data.success && data.perfil) {
                    const fetchedProfile = data.perfil;
                    setProfile(fetchedProfile);
                    if (fetchedProfile.dias_funcionamento.length > 0) {
                        const firstDay = fetchedProfile.dias_funcionamento[0];
                        const times = fetchedProfile.horarios_funcionamento[firstDay];
                        if (times) {
                            setOpeningTime(times.inicio);
                            setClosingTime(times.fim);
                        }
                    }
                }
            } catch (error) {
                addToast('Erro ao carregar perfil', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [session, addToast]);

    const handleDayToggle = (day: string) => {
        setProfile(p => {
            const newDays = p.dias_funcionamento.includes(day)
                ? p.dias_funcionamento.filter(d => d !== day)
                : [...p.dias_funcionamento, day];
            return { ...p, dias_funcionamento: newDays };
        });
    };

    const handleSave = async () => {
        if (!session) return;
        setSaving(true);
        const horariosFuncionamento: { [key: string]: { inicio: string; fim: string } } = {};
        profile.dias_funcionamento.forEach(day => {
            horariosFuncionamento[day] = { inicio: openingTime, fim: closingTime };
        });
        
        try {
            await apiService.saveProfile({ ...profile, horarios_funcionamento: horariosFuncionamento }, session.access_token);
            addToast('Perfil salvo com sucesso!', 'success');
            onClose();
        } catch (error) {
            addToast('Erro ao salvar perfil', 'error');
        } finally {
            setSaving(false);
        }
    };
    
    const addBlockedPeriod = () => {
        const newPeriod: BlockedPeriod = { tipo: 'recorrente', inicio: '12:00', fim: '13:00' };
        setProfile(p => ({ ...p, horarios_bloqueados: [...p.horarios_bloqueados, newPeriod] }));
    };
    
    const updateBlockedPeriod = (index: number, field: keyof BlockedPeriod, value: string) => {
        setProfile(p => {
            const newBlocked = [...p.horarios_bloqueados];
            (newBlocked[index] as any)[field] = value;
             if (field === 'tipo' && value === 'recorrente') {
                delete newBlocked[index].data;
            }
            return { ...p, horarios_bloqueados: newBlocked };
        });
    };

    const removeBlockedPeriod = (index: number) => {
        setProfile(p => ({ ...p, horarios_bloqueados: p.horarios_bloqueados.filter((_, i) => i !== index) }));
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-4 md:space-y-6">
                        <div>
                            <label className="block text-sm font-medium opacity-80 mb-1">Nome do Negócio</label>
                            <input type="text" value={profile.nome_negocio} onChange={e => setProfile({...profile, nome_negocio: e.target.value})} placeholder="Ex: Barbearia do João" className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none text-white text-sm" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium opacity-80 mb-1">Tipo de Negócio</label>
                            <select value={profile.tipo_negocio} onChange={e => setProfile({...profile, tipo_negocio: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none text-white text-sm appearance-none">
                                <option value="barbearia">💈 Barbearia</option>
                                <option value="consultorio">🏥 Consultório</option>
                                <option value="salao">💇 Salão de Beleza</option>
                                <option value="outros">🏢 Outros</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium opacity-80 mb-2">📅 Dias de Funcionamento</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1 md:gap-2">
                               {['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].map(dia => (
                                   <label key={dia} className="flex items-center gap-2 text-xs md:text-sm cursor-pointer p-2 rounded hover:bg-white/5 transition-all">
                                       <input type="checkbox" checked={profile.dias_funcionamento.includes(dia)} onChange={() => handleDayToggle(dia)} className="dias-checkbox rounded bg-white/10 border-white/20 w-4 h-4 text-indigo-500 focus:ring-indigo-500" />
                                       <span className="capitalize">{dia}</span>
                                   </label>
                               ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div>
                                <label className="block text-sm font-medium opacity-80 mb-1">⏰ Horário de Abertura</label>
                                <input type="time" value={openingTime} onChange={e => setOpeningTime(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none text-white text-sm dark-picker" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium opacity-80 mb-1">⏰ Horário de Fechamento</label>
                                <input type="time" value={closingTime} onChange={e => setClosingTime(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none text-white text-sm dark-picker" />
                            </div>
                        </div>
                        <div className="border-t border-white/10 pt-4">
                            <div className="flex items-center justify-between mb-2">
                                 <h4 className="text-base font-semibold">🚫 Bloquear Períodos</h4>
                                 <button onClick={addBlockedPeriod} className="p-2 rounded-lg bg-blue-500/80 hover:bg-blue-500 text-sm flex items-center gap-2"><Plus size={16}/> Adicionar</button>
                            </div>
                             <div className="space-y-2 max-h-40 overflow-y-auto">
                                {profile.horarios_bloqueados.map((period, index) => (
                                    <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2 flex-wrap">
                                        <select value={period.tipo} onChange={e => updateBlockedPeriod(index, 'tipo', e.target.value)} className="bg-black-deep rounded p-1 text-xs appearance-none">
                                            <option value="recorrente">Fixo</option>
                                            <option value="data_especifica">Data Específica</option>
                                        </select>
                                        {period.tipo === 'data_especifica' && (
                                            <input type="date" value={period.data || ''} onChange={e => updateBlockedPeriod(index, 'data', e.target.value)} className="bg-black-deep rounded p-1 text-xs w-full sm:w-auto dark-picker"/>
                                        )}
                                        <input type="time" value={period.inicio} onChange={e => updateBlockedPeriod(index, 'inicio', e.target.value)} className="bg-black-deep rounded p-1 text-xs w-full sm:w-auto flex-grow dark-picker"/>
                                        <span>até</span>
                                        <input type="time" value={period.fim} onChange={e => updateBlockedPeriod(index, 'fim', e.target.value)} className="bg-black-deep rounded p-1 text-xs w-full sm:w-auto flex-grow dark-picker"/>
                                        <button onClick={() => removeBlockedPeriod(index)} className="p-1 text-red-400 hover:text-red-300"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                );
            case 'plan':
                return (
                    <div className="space-y-6">
                        <div className="glass-card p-6 border-silver-accent">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold title-gradient">Plano Premium</h3>
                                <Star className="text-yellow-400" />
                            </div>
                            <p className="mt-2 mb-4 text-white-ice">Desbloqueie todo o potencial da sua agenda com recursos exclusivos.</p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400"/> Análises e Estatísticas com IA</li>
                                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400"/> Sugestões Inteligentes de Horários</li>
                                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400"/> Link de agendamento personalizado</li>
                                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400"/> Agendamentos ilimitados</li>
                                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400"/> Suporte prioritário</li>
                            </ul>
                             <button className="btn-premium w-full mt-6">
                                <span>Fazer Upgrade Agora</span>
                            </button>
                        </div>
                         <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold">Plano Gratuito</h3>
                            <p className="mt-1 mb-3 text-sm text-gray-400">Seu plano atual. Perfeito para começar.</p>
                             <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400"/> Até 50 agendamentos/mês</li>
                                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400"/> Link de agendamento público</li>
                                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400"/> Gestão de horários</li>
                            </ul>
                        </div>
                    </div>
                );
            case 'account':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                            <img src={user?.user_metadata.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full" />
                            <div>
                                <h4 className="font-semibold text-lg">{user?.user_metadata.full_name}</h4>
                                <p className="text-sm text-gray-400">{user?.email}</p>
                            </div>
                        </div>
                        <div className="border border-red-500/30 bg-red-500/10 p-4 rounded-lg">
                            <h4 className="font-semibold text-red-400 flex items-center gap-2"><AlertTriangle size={18}/> Zona de Perigo</h4>
                            <p className="text-sm text-red-400/80 mt-1 mb-3">Ações nesta área são permanentes e não podem ser desfeitas.</p>
                            <button className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all">
                                Excluir Minha Conta
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };


    if(loading) {
        return <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"><Loader/></div>
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-2xl p-4 md:p-6 max-w-2xl w-full mx-2 md:mx-4 animate-fade-in max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg md:text-xl font-semibold">Configurações</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1"><X size={20} /></button>
                </div>

                <div className="flex border-b border-white/10 mb-6">
                    <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'profile' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}>
                        Perfil do Negócio
                    </button>
                    <button onClick={() => setActiveTab('plan')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'plan' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}>
                        Plano & Assinatura
                    </button>
                    <button onClick={() => setActiveTab('account')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'account' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}>
                        Minha Conta
                    </button>
                </div>
                
                <div className="overflow-y-auto flex-1 pr-2 -mr-2 scrollbar-hide">
                    {renderContent()}
                </div>

                {activeTab === 'profile' && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-6 pt-4 border-t border-white/10">
                        <button onClick={onClose} className="flex-1 px-4 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 transition-all text-white order-2 sm:order-1">Cancelar</button>
                        <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 hover:opacity-90 transition-all text-white font-medium flex items-center justify-center gap-2 order-1 sm:order-2">
                            {saving ? <Loader /> : <><Save size={16} /> Salvar Alterações</>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsModal;
