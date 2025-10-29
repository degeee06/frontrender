
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

        const hash = window.location.hash;
        if (hash.includes('access_token') || hash.includes('error')) {
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
            <div className="fixed inset-0 flex justify-center items-center bg-black-absolute">
                <Loader />
            </div>
        );
    }

    return (
        <div className="container">
            {session ? <Dashboard /> : <AuthComponent />}
        </div>
    );
};

export default DashboardPage;
