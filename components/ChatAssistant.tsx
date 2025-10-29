
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Search } from 'react-feather';
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
                setIsOpen(true);
                setShowNotification(false);
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (isOpen) {
            setTimeout(() => setShowNotification(true), 2000);
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
        addMessage('bot', 'Consultando horários...');
        try {
            const profileData = await apiService.getPublicProfile(userId);
            if(profileData.success && profileData.perfil){
                renderAvailableDays(profileData.perfil);
            } else {
                addMessage('bot', 'Não foi possível encontrar o perfil do estabelecimento. ❌');
            }
        } catch (error) {
             addMessage('bot', 'Erro de conexão. 🔌');
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
                    nomeDia: count === 0 ? 'Hoje' : formatDayName(dayName.substring(0,3)),
                    dataFormatada: formatDate(isoDate).slice(0,5),
                    ehHoje: count === 0,
                });
            }
            count++;
        }

        addMessage('component', (
            <div className="p-2 rounded-lg text-xs space-y-2">
                <strong>📅 Próximas datas disponíveis:</strong>
                 <div className="grid grid-cols-3 gap-2 mt-1">
                    {availableDays.map(day => (
                        <button key={day.data} onClick={() => handleDateSelect(day.data)}
                                className={`p-2 rounded-md text-center text-xs transition-colors ${day.ehHoje ? 'bg-green-500/30 font-bold hover:bg-green-500/40' : 'bg-blue-500/20 hover:bg-blue-500/30'}`}>
                            <strong>{day.nomeDia}</strong><br/>{day.dataFormatada}
                        </button>
                    ))}
                </div>
            </div>
        ));
    };
    
    const handleDateSelect = async (date: string) => {
        addMessage('user', `Ver horários para ${formatDate(date)}`);
        addMessage('bot', 'Verificando...');
        try {
            const data = await apiService.getAvailableTimes(userId, date);
            if(data.success && data.horariosDisponiveis.length > 0) {
                 const availableTimes = data.horariosDisponiveis.map((h:string) => h.substring(0,5));
                 addMessage('component', (
                    <div className="p-2 rounded-md text-xs space-y-2">
                        <strong>🕐 Horários para {formatDate(date)}:</strong>
                        <div className="grid grid-cols-4 gap-1 mt-1">
                            {availableTimes.map((time: string) => (
                                <button key={time} onClick={() => handleTimeSelect(date, time)}
                                        className="p-1.5 rounded bg-white/10 text-xs hover:bg-blue-500/30 transition-colors">
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>
                 ));
            } else {
                addMessage('bot', `Nenhum horário livre para ${formatDate(date)}.`);
            }
        } catch (error) {
            addMessage('bot', 'Erro ao buscar horários.');
        }
    }
    
    const handleTimeSelect = (date: string, time: string) => {
        addMessage('user', `Quero ${time}.`);
        addMessage('bot', 'Perfeito! Preencha seus dados no formulário para confirmar. ✅');
        onTimeSelect(date, time);
        toggleChat();
    }


    return (
        <>
            <button onClick={toggleChat} className="chat-abrir-btn">
                <MessageCircle size={28} />
                {showNotification && <div className="chat-badge">!</div>}
            </button>
            <div className={`chat-flutuante glass-card ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <div className="p-4 flex justify-between items-center border-b border-black-light">
                    <h3 className="text-base font-semibold">💬 Assistente Virtual</h3>
                    <button onClick={toggleChat} className="p-1 rounded-full hover:bg-white/10"><X size={20} /></button>
                </div>
                <div className="chat-messages flex-1 p-4 space-y-3">
                    {messages.map((msg, index) => (
                         <div key={index} className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${msg.type === 'bot' || msg.type === 'component' ? 'bg-indigo-500/20 mr-auto' : 'bg-blue-500/20 ml-auto'}`}>
                            {msg.content}
                         </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-black-light">
                    <button onClick={handleLoadTimes} disabled={loading} className="btn btn-primary w-full">
                        {loading ? <Loader/> : <><Search size={16}/> Ver Horários</>}
                    </button>
                </div>
            </div>
        </>
    );
};

export default ChatAssistant;
