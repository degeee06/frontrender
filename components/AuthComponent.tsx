
import React, { useState } from 'react';
import { supabase, getRedirectUrl } from '../services/supabase';
import { useToast } from '../contexts/ToastContext';
import { Lock, Shield } from 'react-feather';

const AuthComponent: React.FC = () => {
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const handleGoogleLogin = async () => {
        if (!termsAccepted) {
            addToast("Aceite os termos para continuar", "error");
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: getRedirectUrl(),
                },
            });
            if (error) throw error;
        } catch (error) {
            addToast("Erro ao conectar com Google", "error");
            setLoading(false);
        }
    };

    return (
        <div className="glass-card rounded-3xl p-6 sm:p-10 mb-8" data-aos="fade-up">
            <div className="text-center mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-2xl bg-black-light border border-gray-steel shadow-2xl flex items-center justify-center">
                    <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-white-ice" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold title-gradient mb-3">Acesso ao Sistema</h2>
                <p className="text-white-ice sm:text-lg">Entre com sua conta Google</p>
            </div>

            <div className="max-w-sm mx-auto space-y-6">
                <button 
                    onClick={handleGoogleLogin} 
                    disabled={loading}
                    className="w-full group py-3 px-4 sm:py-4 sm:px-8 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-4 bg-[#000000] border border-[#333333] hover:bg-[#111111] hover:border-[#5A5A5A] hover:shadow-2xl hover:-translate-y-0.5"
                >
                    {loading ? <div className="loading-spinner"></div> : (
                        <>
                            <svg className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span className="text-sm sm:text-base group-hover:text-white transition-colors duration-300">Continuar com Google</span>
                        </>
                    )}
                </button>
                
                <div className="p-4 bg-black-deep rounded-lg border border-black-light">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
                               className="mt-1 rounded bg-black-medium border-gray-steel focus:ring-2 focus:ring-silver-accent text-indigo-500" />
                        <span className="text-sm text-white-ice">
                            Concordo com os Termos de Uso e Política de Privacidade.
                        </span>
                    </label>
                </div>
                
                <div className="text-center p-4 bg-black-deep rounded-2xl border border-black-light">
                    <p className="text-white-ice text-sm flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4 text-silver-accent" />
                        <span className="font-medium">Login 100% seguro</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthComponent;
