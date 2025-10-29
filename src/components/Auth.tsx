
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/api';
import { showToast } from './shared/Toast';

const getRedirectUrl = () => {
    // In a real Capacitor app, you might use a custom scheme.
    // For this web-based React app, window.location.origin is correct.
    return window.location.origin;
}

const TermsModal: React.FC<{ isOpen: boolean; onClose: () => void; onAccept: () => void; }> = ({ isOpen, onClose, onAccept }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1A] border border-[#333333] shadow-[0_8px_40px_rgba(0,0,0,0.5)] rounded-2xl p-6 w-full max-w-lg animate-fade-in">
                <div className="flex items-center justify-center mb-6">
                    <div className="p-3 rounded-full bg-[#333333] border border-[#5A5A5A] shadow-lg">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#E0E0E0]"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2 bg-gradient-to-r from-white to-[#E0E0E0] bg-clip-text text-transparent">📝 Termos de Uso</h3>
                <p className="text-center text-[#E0E0E0] mb-6">Leia e aceite para continuar</p>
                <div className="bg-[#111111] rounded-lg p-4 mb-6 max-h-60 overflow-y-auto">
                   {/* Terms content */}
                   <div className="text-sm space-y-3 text-[#E0E0E0]">
                        <strong>Data de criação: 2025</strong>
                        <h4 className="font-semibold text-[#C0C0C0]">1. Aceitação dos Termos</h4>
                        <p>Ao utilizar nosso sistema de agendamentos, você concorda com estes Termos de Uso e nossa Política de Privacidade.</p>
                        <h4 className="font-semibold text-[#C0C0C0]">2. Uso do Serviço</h4>
                        <p>Você concorda em usar a plataforma apenas para fins legítimos de agendamento de serviços, sendo responsável por todas as informações cadastradas.</p>
                   </div>
                </div>
                <div className="flex flex-col gap-3">
                    <button onClick={onClose} className="w-full px-4 py-3 rounded-lg bg-[#333333] hover:bg-[#5A5A5A] transition-all text-white font-medium border border-[#333333]">Recusar</button>
                    <button onClick={onAccept} className="w-full px-4 py-3 rounded-lg bg-[#333333] hover:bg-[#5A5A5A] transition-all text-white font-medium border border-[#C0C0C0]">✅ Aceitar e Continuar</button>
                </div>
            </div>
        </div>
    );
};

const Auth: React.FC = () => {
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('termsAccepted') === 'true') {
            setTermsAccepted(true);
        }
    }, []);

    const handleAcceptTerms = () => {
        localStorage.setItem('termsAccepted', 'true');
        setTermsAccepted(true);
        setIsTermsModalOpen(false);
        showToast('Termos aceitos com sucesso!', 'success');
    };

    const handleGoogleLogin = async () => {
        if (!termsAccepted) {
            showToast("❌ Aceite os termos para continuar", "error");
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: getRedirectUrl(),
                },
            });

            if (error) {
                throw error;
            }
            // The user will be redirected by Supabase
        } catch (error) {
            console.error('Error with Google Login:', error);
            showToast("Erro ao conectar com Google", "error");
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl flex justify-center items-center min-h-screen">
            <div className="bg-[#1A1A1A] border border-[#333333] shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-3xl p-10 w-full max-w-lg" data-aos="fade-up">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#333333] border border-[#5A5A5A] shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#E0E0E0]"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-[#E0E0E0] bg-clip-text text-transparent mb-3">Acesso ao Sistema</h2>
                    <p className="text-[#E0E0E0] text-lg">Entre com sua conta Google</p>
                </div>

                <div className="max-w-sm mx-auto space-y-6">
                    <button onClick={handleGoogleLogin} disabled={loading} className="w-full group py-4 px-8 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-4 bg-[#000000] border border-[#333333] text-[#E0E0E0] shadow-[0_4px_15px_rgba(0,0,0,0.5)] hover:bg-[#111111] hover:border-[#5A5A5A] hover:translate-y-[-2px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.7)] disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? (
                            <div className="border-2 border-gray-500 rounded-full border-t-2 border-t-white w-6 h-6 animate-spin"></div>
                        ) : (
                            <svg className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                        )}
                        <span className="group-hover:text-white transition-colors duration-300">{loading ? "Conectando..." : "Continuar com Google"}</span>
                    </button>

                    <div className="p-4 bg-[#111111] rounded-lg border border-[#333333]">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} required className="mt-1 rounded bg-[#1A1A1A] border-[#5A5A5A] focus:ring-2 focus:ring-[#C0C0C0] text-[#C0C0C0]"/>
                            <span className="text-sm text-[#E0E0E0]">Concordo com os <button type="button" onClick={() => setIsTermsModalOpen(true)} className="text-[#C0C0C0] hover:text-white underline">Termos de Uso</button></span>
                        </label>
                    </div>

                    <div className="text-center p-4 bg-[#111111] rounded-2xl border border-[#333333]">
                        <p className="text-[#E0E0E0] text-sm flex items-center justify-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#C0C0C0]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            <span className="font-medium">Login 100% seguro</span><span className="text-[#5A5A5A]">•</span><span>Seus dados protegidos</span>
                        </p>
                    </div>
                </div>
            </div>
            <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} onAccept={handleAcceptTerms} />
        </div>
    );
};

export default Auth;
