import React from 'react';
import { usePremium } from '../contexts/PremiumContext';

const PremiumBadge: React.FC = () => {
    const { status, loading } = usePremium();

    if (loading || (!status.isPremium && !status.hasTrial)) {
        return null;
    }

    if (status.isPremium) {
        return (
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1.5 rounded-lg flex items-center justify-center gap-2 shadow-md">
                <span>🚀 Premium</span>
            </div>
        );
    }

    const used = status.dailyLimit - status.dailyUsagesLeft;
    let badgeColor = 'from-green-500 to-emerald-500';
    if(status.dailyUsagesLeft <= 0) {
        badgeColor = 'from-red-500 to-rose-600';
    } else if (status.dailyUsagesLeft <= 2) {
        badgeColor = 'from-yellow-500 to-amber-600';
    }

    return (
        <div className={`bg-gradient-to-r ${badgeColor} text-white text-xs px-3 py-1.5 rounded-lg flex items-center justify-center gap-2 shadow-md`}>
            <span>🎯 {used}/{status.dailyLimit}</span>
        </div>
    );
};

export default PremiumBadge;
