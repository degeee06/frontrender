
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { Calendar, Clock, Mail, Phone, User, Plus, AlertTriangle, CheckCircle, MessageCircle } from 'react-feather';
import AOS from 'aos';
import { apiService } from '../services/apiService';
import ChatAssistant from '../components/ChatAssistant';
import Loader from '../components/Loader';

interface IFormInput {
    nome: string;
    email?: string;
    telefone: string;
    data: string;
    horario: string;
}

type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error';
interface SubmissionResult {
    message: string;
    data?: IFormInput;
}

const PublicSchedulePage: React.FC = () => {
    const { userId, t } = useParams<{ userId: string; t: string }>();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm<IFormInput>();
    
    const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
    const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
    const [isLinkValid, setIsLinkValid] = useState(true);

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
        if (!userId || !t) {
            setIsLinkValid(false);
        }
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('data') as HTMLInputElement;
        if(dateInput) {
            dateInput.min = today;
        }
    }, [userId, t]);

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        if (!userId || !t) {
            setIsLinkValid(false);
            return;
        }
        setSubmissionStatus('loading');
        
        const dataAgendamento = new Date(`${data.data}T${data.horario}`);
        if (dataAgendamento < new Date()) {
            setSubmissionStatus('error');
            setSubmissionResult({ message: 'Não é possível agendar no passado.' });
            return;
        }

        try {
            const result = await apiService.submitPublicAppointment({
                ...data,
                email: data.email || 'Não informado',
                user_id: userId,
                t: t,
            });

            if (result.success) {
                setSubmissionStatus('success');
                setSubmissionResult({ message: result.msg, data });
            } else {
                setSubmissionStatus('error');
                setSubmissionResult({ message: result.msg || 'Erro ao agendar.' });
            }
        } catch (error) {
            setSubmissionStatus('error');
            setSubmissionResult({ message: 'Erro de conexão. Tente novamente.' });
        }
    };

    if (!isLinkValid) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl" data-aos="fade-up">
                <div className="glass-card rounded-2xl p-6 text-center error-message">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Link Inválido</h3>
                    <p>Este link de agendamento é inválido ou expirado.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <header className="text-center mb-8" data-aos="fade-down">
                <h1 className="text-3xl md:text-4xl font-bold title-gradient">Agendar Compromisso</h1>
                <p className="text-lg opacity-90">Preencha os dados para agendar seu compromisso</p>
            </header>

            {userId && <ChatAssistant userId={userId} onTimeSelect={(date, time) => {
                setValue('data', date);
                setValue('horario', time);
            }} />}

            {submissionStatus === 'idle' || submissionStatus === 'loading' ? (
                 <form onSubmit={handleSubmit(onSubmit)} className="glass-card rounded-2xl p-6 md:p-8 mb-6" data-aos="fade-up">
                    <div className="space-y-5">
                       {/* Form fields */}
                       <div>
                           <label htmlFor="nome" className="block mb-2 text-sm font-medium text-gray-300">Nome Completo</label>
                           <div className="relative">
                               <User className="absolute inset-y-0 left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                               <input type="text" id="nome" placeholder="Seu nome completo" {...register('nome', { required: true })}
                                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-cyan-400 focus:outline-none text-black text-sm" />
                           </div>
                       </div>
                       <div>
                           <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">Email <span className="text-gray-400 text-xs">(opcional)</span></label>
                           <div className="relative">
                               <Mail className="absolute inset-y-0 left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                               <input type="email" id="email" placeholder="email@exemplo.com" {...register('email')}
                                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-cyan-400 focus:outline-none text-black text-sm" />
                           </div>
                       </div>
                        <div>
                           <label htmlFor="telefone" className="block mb-2 text-sm font-medium text-gray-300">Telefone</label>
                            <div className="relative">
                               <Phone className="absolute inset-y-0 left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                               <IMaskInput
                                   mask="(00) 00000-0000"
                                   id="telefone"
                                   placeholder="(00) 00000-0000"
                                   {...register('telefone', { required: true })}
                                   className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-cyan-400 focus:outline-none text-black text-sm"
                               />
                            </div>
                        </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                               <label htmlFor="data" className="block mb-2 text-sm font-medium text-gray-300">Data</label>
                               <div className="relative">
                                   <Calendar className="absolute inset-y-0 left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                   <input type="date" id="data" {...register('data', { required: true })}
                                          className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-cyan-400 focus:outline-none text-black text-sm" />
                               </div>
                           </div>
                           <div>
                               <label htmlFor="horario" className="block mb-2 text-sm font-medium text-gray-300">Horário</label>
                               <div className="relative">
                                   <Clock className="absolute inset-y-0 left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                   <input type="time" id="horario" {...register('horario', { required: true })}
                                          className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-cyan-400 focus:outline-none text-black text-sm" />
                               </div>
                           </div>
                       </div>
                       <button type="submit" disabled={submissionStatus === 'loading'} className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 text-white font-semibold flex items-center justify-center gap-2 mt-6">
                           {submissionStatus === 'loading' ? <Loader /> : <><Plus className="w-4 h-4" /> <span>Agendar Compromisso</span></>}
                       </button>
                    </div>
                 </form>
            ) : (
                <div id="resultado" className="glass-card rounded-2xl p-6 text-center" data-aos="fade-up">
                    {submissionStatus === 'success' && submissionResult?.data && (
                        <div className="p-6 rounded-lg success-message">
                            <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Agendamento Confirmado!</h3>
                            <p className="mb-4">{submissionResult.message}</p>
                            <div className="bg-white/10 rounded-lg p-4 text-left">
                                <p><strong>Nome:</strong> {submissionResult.data.nome}</p>
                                <p><strong>Data:</strong> {new Date(submissionResult.data.data + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                <p><strong>Horário:</strong> {submissionResult.data.horario}</p>
                            </div>
                        </div>
                    )}
                    {submissionStatus === 'error' && (
                         <div className="p-6 rounded-lg error-message">
                            <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Erro no Agendamento</h3>
                            <p>{submissionResult?.message}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PublicSchedulePage;
