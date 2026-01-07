import React, { useState } from 'react';
import { HistoryList } from '../components/stats/HistoryList';
import { ProgressChart } from '../components/stats/ProgressChart';

export default function Stats() {
    const [activeTab, setActiveTab] = useState('chart');

    return (
        <div className="pb-20 space-y-6">
            <h1 className="text-2xl font-bold">Estadísticas</h1>

            <div className="flex space-x-1 bg-surface p-1 rounded-lg">
                <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'chart' ? 'bg-surface-light text-white' : 'text-text-secondary hover:text-text-primary'}`}
                    onClick={() => setActiveTab('chart')}
                >
                    Progreso
                </button>
                <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'history' ? 'bg-surface-light text-white' : 'text-text-secondary hover:text-text-primary'}`}
                    onClick={() => setActiveTab('history')}
                >
                    Historial
                </button>
            </div>

            <div>
                {activeTab === 'chart' ? <ProgressChart /> : <HistoryList />}
            </div>
        </div>
    );
}
