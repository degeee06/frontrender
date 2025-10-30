import React, { useEffect } from 'react';
import { Clock, Star, Zap } from 'react-feather';

interface LimitReachedModalProps {
    dailyLimit: number;
    onClose: () => void;
}

const LimitReachedModal: React.FC<LimitReachedModalProps> = ({ dailyLimit, onClose }) => {
    
    useEffect(() => {
        // This script is from the original index.html to load Hotmart's widget
        const scriptId = 'hotmart-script';
        if (document.getElementById(scriptId)) return;

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://static.hotmart.com/checkout/widget.min.js';
        document.head.appendChild(script);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'https://static.hotmart.com/css/hotmart-fb.min.css';
        document.head.appendChild(link);
        
        return () => {
            // Optional cleanup if modal is destroyed
            const existingScript = document.getElementById(scriptId);
            if(existingScript) {
                // In a real SPA, you might not want to remove it, but for completeness:
                // existingScript.remove();
            }
        }
    }, []);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1002] p-4">
            <div className="glass-card rounded-2xl p-6 md:p-8 w-full max-w-md mx-auto animate-fade-in">
                <div className="flex items-center justify-center mb-6">
                    <div className="p-3 rounded-full bg-gradient-to-br from-red-500 to-rose-500 shadow-lg">
                        <Clock className="w-6 h-6 text-white" />
                    </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-semibold text-center mb-2">⏰ Limite Diário Atingido</h3>
                <p className="text-center text-gray-300 mb-6">Você utilizou todos os {dailyLimit} agendamentos de hoje.</p>

                <div className="bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30 rounded-xl p-4 mb-6 text-center">
                    <p className="text-red-400 font-semibold text-lg">{dailyLimit}/{dailyLimit} usos realizados</p>
                    <p className="text-red-300 text-sm mt-1">Os usos resetam à meia-noite! 🕛</p>
                </div>

                <div className="space-y-3">
                    <a 
                       href="https://pay.hotmart.com/U102480243K?checkoutMode=2" 
                       className="hotmart-fb hotmart__button-checkout w-full px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                       style={{ textDecoration: 'none' }} // Ensure no underline from browser defaults
                    >
                        <Star className="w-4 h-4" />
                        🚀 Fazer Upgrade Ilimitado
                    </a>
                    
                    <button onClick={onClose} 
                            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-gray-300 font-medium transition-all flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4" />
                        Entendi, aguardar reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LimitReachedModal;
