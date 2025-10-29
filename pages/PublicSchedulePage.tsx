
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { Calendar, Clock, Mail, Phone, User, Plus, AlertTriangle, CheckCircle } from 'react-feather';
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
    const { register, handleSubmit, setValue } = useForm<IFormInput>();
    
    const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
    const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
    const [isLinkValid, setIsLinkValid] = useState(true);

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
        if (!userId || !t) {
            setIsLinkValid(false);
        }
        const today = new Date().toISOString().split('T')[0];
        setValue('data', today);
    }, [userId, t, setValue]);

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        if (!userId || !t) {
            setIsLinkValid(false);
            return;
        }
        setSubmissionStatus('loading');
        
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
            <div className="container" data-aos="fade-up">
                <div className="glass-card p-6 text-center error-message">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Link Inválido</h3>
                    <p>Este link de agendamento é inválido ou expirado.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="container">
            <header className="text-center mb-8" data-aos="fade-down">
                <h1 className="text-3xl md:text-4xl font-bold title-gradient">Agendar Compromisso</h1>
                <p className="text-lg opacity-90 mt-2">Preencha os dados para agendar seu compromisso</p>
            </header>

            {userId && <ChatAssistant userId={userId} onTimeSelect={(date, time) => {
                setValue('data', date);
                setValue('horario', time);
            }} />}

            {submissionStatus === 'idle' || submissionStatus === 'loading' ? (
                 <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 md:p-8" data-aos="fade-up">
                    <div className="space-y-5">
                       <div className="form-input-group">
                           <User className="form-input-icon" size={20} />
                           <input type="text" placeholder="Seu nome completo" {...register('nome', { required: true })}
                                  className="form-input form-input-white" />
                       </div>
                       <div className="form-input-group">
                           <Mail className="form-input-icon" size={20} />
                           <input type="email" placeholder="Email (opcional)" {...register('email')}
                                  className="form-input form-input-white" />
                       </div>
                        <div className="form-input-group">
                           <Phone className="form-input-icon" size={20} />
                           <IMaskInput
                               mask="(00) 00000-0000"
                               placeholder="(00) 00000-0000"
                               {...register('telefone', { required: true })}
                               className="form-input form-input-white"
                           />
                        </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="form-input-group">
                               <Calendar className="form-input-icon" size={20} />
                               <input type="date" {...register('data', { required: true })}
                                      className="form-input form-input-white" />
                           </div>
                           <div className="form-input-group">
                               <Clock className="form-input-icon" size={20} />
                               <input type="time" {...register('horario', { required: true })}
                                      className="form-input form-input-white" />
                           </div>
                       </div>
                       <button type="submit" disabled={submissionStatus === 'loading'} className="btn btn-primary w-full mt-6">
                           {submissionStatus === 'loading' ? <Loader /> : <><Plus size={20} /> <span>Agendar Compromisso</span></>}
                       </button>
                    </div>
                 </form>
            ) : (
                <div className="glass-card p-6 text-center" data-aos="fade-up">
                    {submissionStatus === 'success' && submissionResult?.data && (
                        <div className="p-6 rounded-lg success-message">
                            <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Agendamento Confirmado!</h3>
                            <p className="mb-4">{submissionResult.message}</p>
                            <div className="bg-white/10 rounded-lg p-4 text-left space-y-2">
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
