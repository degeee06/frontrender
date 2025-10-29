
import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import { useAuth } from '../contexts/AuthContext';
import AuthComponent from '../components/AuthComponent';
import Dashboard from '../components/Dashboard';
import Loader from '../components/Loader';

const DashboardPage: React.FC = () => {
    const { session, loading } = useAuth();
    const [isHandlingCallback, setIsHandlingCallback] = useState(true);

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
        });

        // This effect handles the OAuth callback by checking the URL hash.
        // It runs only once on component mount.
        const hash = window.location.hash;
        if (hash.includes('access_token') || hash.includes('error')) {
            // Supabase client's onAuthStateChange listener will handle setting the session.
            // We just need to wait and clean up the URL.
            // The loading state from useAuth will cover the UI transition.
            setTimeout(() => {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
                setIsHandlingCallback(false);
            }, 500);
        } else {
            setIsHandlingCallback(false);
        }
    }, []);

    if (loading || isHandlingCallback) {
        return (
            <div className="auth-screen flex justify-center items-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {session ? <Dashboard /> : <AuthComponent />}
        </div>
    );
};

export default DashboardPage;
