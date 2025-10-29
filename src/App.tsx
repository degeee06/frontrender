
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './services/api';
import type { Session } from '@supabase/supabase-js';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { ToastContainer, showToast } from './components/shared/Toast';

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        feather: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        AOS: any;
    }
}

const AuthCallbackScreen: React.FC = () => (
    <div className="fixed top-0 left-0 w-full h-full bg-[#000000] text-[#E0E0E0] flex justify-center items-center z-[9999]">
        <div className="bg-[#1A1A1A] border border-[#333333] shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-2xl p-6 md:p-8 w-full max-w-md mx-auto animate-fade-in">
            <div className="flex items-center justify-center mb-6">
                <div className="p-3 rounded-full bg-[#333333] border border-[#5A5A5A] shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#E0E0E0]"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-center mb-2 bg-gradient-to-r from-white to-[#E0E0E0] bg-clip-text text-transparent">Autenticando</h2>
            <p className="text-center text-[#E0E0E0] mb-6">Conectando sua conta...</p>
            <div className="flex justify-center mb-6">
                <div className="border-4 border-[rgba(255,255,255,0.1)] rounded-full border-t-4 border-t-[#E0E0E0] w-10 h-10 animate-spin"></div>
            </div>
            <div className="text-center space-y-4">
                <p className="text-[#E0E0E0] animate-pulse">Redirecionando de volta para o app</p>
            </div>
        </div>
    </div>
);

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthCallback, setIsAuthCallback] = useState(false);

    const handleAuthCallback = useCallback(() => {
        if (window.location.hash.includes('access_token') || window.location.hash.includes('error')) {
            setIsAuthCallback(true);
            const processCallback = async () => {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('Error getting session from callback:', error);
                    showToast('Erro ao processar login', 'error');
                }
                if (session) {
                    setSession(session);
                    showToast('Login realizado com sucesso!', 'success');
                }
                window.history.replaceState(null, '', window.location.pathname);
                setIsAuthCallback(false);
                setLoading(false);
            };
            // Delay to allow Supabase to handle the session from the URL
            setTimeout(processCallback, 500);
            return true;
        }
        return false;
    }, []);

    useEffect(() => {
        window.AOS.init({
            duration: 800,
            easing: 'ease-out-quart',
            once: true
        });
        
        if (handleAuthCallback()) {
            return;
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, [handleAuthCallback]);
    
    useEffect(() => {
        if (!loading) {
            setTimeout(() => window.feather?.replace(), 100);
        }
    }, [loading, session]);

    if (loading) {
        return (
            <div className="fixed top-0 left-0 w-full h-full bg-black flex justify-center items-center">
                <div className="border-4 border-gray-800 rounded-full border-t-4 border-t-gray-200 w-12 h-12 animate-spin"></div>
            </div>
        );
    }
    
    if (isAuthCallback) {
        return <AuthCallbackScreen />;
    }

    return (
        <div className="min-h-screen bg-black">
            {!session ? <Auth /> : <Dashboard session={session} />}
            <ToastContainer />
        </div>
    );
};

export default App;
