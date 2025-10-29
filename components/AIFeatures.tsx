
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { geminiService } from '../services/geminiService';
import Loader from './Loader';

const AIFeatures: React.FC = () => {
    const { session } = useAuth();
    const [suggestions, setSuggestions] = useState<string | null>(null);
    const [statistics, setStatistics] = useState<any | null>(null);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);

    const handleSuggestTimes = async () => {
        if (!session) return;
        setLoadingSuggestions(true);
        try {
            const data = await geminiService.suggestTimes(session.access_token);
            if (data.success) {
                setSuggestions(data.sugestoes);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingSuggestions(false);
        }
    };
    
    const handleGetStats = async () => {
        if (!session) return;
        setLoadingStats(true);
        try {
            const data = await geminiService.getStatistics(session.access_token);
            if (data.success) {
                setStatistics(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStats(false);
        }
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="agendamento-ia-section glass-card" data-aos="fade-up">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 title-gradient">
                    <span>🎯</span> Sugerir Horários Livres
                </h3>
                <button onClick={handleSuggestTimes} disabled={loadingSuggestions} className="w-full px-4 py-3 rounded-lg bg-black-light hover:bg-gray-steel text-white-pure font-medium transition-all flex items-center justify-center gap-2 border border-black-light">
                    {loadingSuggestions ? <Loader /> : <><span>📅</span> Encontrar Melhores Horários</>}
                </button>
                {suggestions && <div className="mt-4 p-4 bg-black-deep rounded-lg whitespace-pre-wrap">{suggestions}</div>}
            </div>
            <div className="sugestoes-ia-section glass-card" data-aos="fade-up">
                 <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 title-gradient">
                    <span>📊</span> Análise e Estatísticas
                </h3>
                <button onClick={handleGetStats} disabled={loadingStats} className="w-full px-4 py-3 rounded-lg bg-black-light hover:bg-gray-steel text-white-pure font-medium transition-all flex items-center justify-center gap-2 border border-black-light">
                     {loadingStats ? <Loader /> : <><span>📈</span> Ver Estatísticas Detalhadas</>}
                </button>
                {statistics && (
                    <div className="mt-4 p-4 bg-black-deep rounded-lg">
                        <h4 className="font-bold mb-2">Análise IA:</h4>
                        <p className="whitespace-pre-wrap mb-4">{statistics.analise_ia}</p>
                        <h4 className="font-bold mb-2">Estatísticas:</h4>
                        <ul>
                            <li>Total: {statistics.estatisticas.total}</li>
                            <li>Este Mês: {statistics.estatisticas.este_mes}</li>
                            <li>Confirmados: {statistics.estatisticas.confirmados}</li>
                            <li>Taxa de Comparecimento: {statistics.estatisticas.taxa_comparecimento}</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIFeatures;
