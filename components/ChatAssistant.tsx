
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Search, Clock } from 'react-feather';
import { apiService } from '../services/apiService';
import { UserProfile } from '../types';
import Loader from './Loader';

interface ChatAssistantProps {
    userId: string;
    onTimeSelect: (date: string, time: string) => void;
}

interface Message {
    type: 'bot' | 'user' | 'component';
    content: React.ReactNode;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ userId, onTimeSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { type: 'bot', content: <strong>Olá! Posso ajudar você a encontrar horários disponíveis! 😊</strong> }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isOpen) {
                setShowNotification(true);
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (isOpen) {
            setTimeout(() => setShowNotification(true), 1000);
        } else {
            setShowNotification(false);
        }
    };
    
    const addMessage = (type: Message['type'], content: React.ReactNode) => {
        setMessages(prev => [...prev, { type, content }]);
    };
    
    const formatDayName = (day: string) => day.charAt(0).toUpperCase() + day.slice(1);
    const formatDate = (dateString: string) => new Date(dateString + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' });

    const handleLoadTimes = async () => {
        setLoading(true);
        addMessage('bot', 'Consultando horários reais do sistema... ⏳');
        try {
            const profileData = await apiService.getPublicProfile(userId);
            if(profileData.success && profileData.perfil){
                const profile: UserProfile = profileData.perfil;
                 addMessage('component', (
                    <div className="info-box bg-blue-500/10 border-blue-500/30 p-2 rounded-md text-xs">
                        <strong>🕒 Horários de Funcionamento:</strong><br />
                        {Object.entries(profile.horarios_funcionamento).map(([day, times]) => (
                            <div key={day}>{formatDayName(day)}: {times.inicio} às {times.fim}</div>
                        ))}
                    </div>
                ));
                 // Render next 5 available days
                renderAvailableDays(profile);
            } else {
                addMessage('bot', 'Não foi possível encontrar o perfil do estabelecimento. ❌');
            }
        } catch (error) {
             addMessage('bot', 'Erro de conexão. Tente novamente mais tarde. 🔌');
        } finally {
            setLoading(false);
        }
    };

    const renderAvailableDays = (profile: UserProfile) => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const availableDays: {data: string, nomeDia: string, dataFormatada: string, ehHoje: boolean}[] = [];
        let count = 0;
        while(availableDays.length < 5 && count < 30) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + count);
            const dayName = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][currentDate.getDay()];
            
            if(profile.dias_funcionamento.includes(dayName)) {
                const isoDate = currentDate.toISOString().split('T')[0];
                availableDays.push({
                    data: isoDate,
                    nomeDia: count === 0 ? 'Hoje' : formatDayName(dayName),
                    dataFormatada: formatDate(isoDate),
                    ehHoje: count === 0,
                });
            }
            count++;
        }

        addMessage('component', (
            <div className="info-box bg-green-500/10 border-green-500/30 p-2 rounded-md text-xs">
                <strong>📅 Datas Disponíveis:</strong>
                 <div className="grid grid-cols-2 gap-2 mt-2">
                    {availableDays.map(day => (
                        <button key={day.data} onClick={() => handleDateSelect(day.data)}
                                className={`p-2 rounded-md text-center text-xs ${day.ehHoje ? 'bg-green-500/30 font-bold' : 'bg-blue-500/20'}`}>
                            <strong>{day.nomeDia}</strong><br/>{day.dataFormatada}
                        </button>
                    ))}
                </div>
            </div>
        ));
        addMessage('bot', 'Clique em uma data para ver os horários disponíveis! 🕐');
    };
    
    const handleDateSelect = async (date: string) => {
        addMessage('user', `Selecionei ${formatDate(date)}`);
        addMessage('bot', 'Verificando horários disponíveis... 🔄');
        try {
            const data = await apiService.getAvailableTimes(userId, date);
            if(data.success && data.horariosDisponiveis.length > 0) {
                 const availableTimes = data.horariosDisponiveis.map((h:string) => h.substring(0,5));
                 addMessage('component', (
                    <div className="info-box bg-purple-500/10 border-purple-500/30 p-2 rounded-md text-xs">
                        <strong>🕐 Horários para {formatDate(date)}:</strong>
                        <div className="grid grid-cols-3 gap-1 mt-2">
                            {availableTimes.map((time: string) => (
                                <button key={time} onClick={() => handleTimeSelect(date, time)}
                                        className="p-1 rounded bg-white/10 text-xs hover:bg-blue-500/30">
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>
                 ));
            } else {
                addMessage('bot', `Nenhum horário disponível para ${formatDate(date)}. Tente outra data.`);
            }
        } catch (error) {
            addMessage('bot', 'Erro ao buscar horários.');
        }
    }
    
    const handleTimeSelect = (date: string, time: string) => {
        addMessage('user', `Quero agendar às ${time}.`);
        addMessage('bot', 'Perfeito! Preencha seus dados no formulário principal para confirmar. ✅');
        onTimeSelect(date, time);
        toggleChat();
    }


    return (
        <>
            <button onClick={toggleChat} className="chat-abrir-btn fixed bottom-5 right-5 w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full text-white flex items-center justify-center shadow-lg z-50 hover:scale-110 transition-transform">
                <MessageCircle size={28} />
                {showNotification && <div className="chat-badge absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center animate-pulse">!</div>}
            </button>
            <div className={`chat-flutuante fixed bottom-5 right-5 w-[350px] h-[450px] bg-[--black-medium] border border-[--black-light] rounded-2xl shadow-deep z-[100] flex flex-col overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <div className="chat-header bg-[--black-light] p-4 flex justify-between items-center border-b border-[--black-light]">
                    <h3 className="text-base font-semibold">💬 Assistente de Agendamento</h3>
                    <button onClick={toggleChat} className="p-1"><X size={20} /></button>
                </div>
                <div className="chat-messages flex-1 p-4 overflow-y-auto bg-[--black-deep] space-y-3">
                    {messages.map((msg, index) => (
                         <div key={index} className={`chat-message max-w-[85%] p-3 rounded-xl text-sm ${msg.type === 'bot' || msg.type === 'component' ? 'bg-indigo-500/20 mr-auto' : 'bg-blue-500/20 ml-auto'}`}>
                            {msg.content}
                         </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="chat-actions p-4 border-t border-[--black-light] bg-[--black-medium]">
                    <button onClick={handleLoadTimes} disabled={loading} className="w-full p-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                        {loading ? <Loader/> : <><Search size={16}/> Ver Horários Disponíveis</>}
                    </button>
                </div>
            </div>
        </>
    );
};

export default ChatAssistant;
