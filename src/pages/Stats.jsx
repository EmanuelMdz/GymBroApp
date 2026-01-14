import React, { useState, useMemo } from 'react';
import { HistoryList } from '../components/stats/HistoryList';
import { ProgressChart } from '../components/stats/ProgressChart';
import { useWorkout } from '../contexts/WorkoutContext';
import { useExercises } from '../contexts/ExerciseContext';
import { Card } from '../components/common/Card';
import { Trophy, TrendingUp, Dumbbell, Calendar } from 'lucide-react';

export default function Stats() {
    const [activeTab, setActiveTab] = useState('progress');
    const { history } = useWorkout();
    const { exercises } = useExercises();

    // Calculate overall stats and PRs
    const stats = useMemo(() => {
        const totalSessions = history.length;
        
        // Calculate total volume ever
        const totalVolume = history.reduce((acc, session) => {
            return acc + (session.exercises || []).reduce((exAcc, ex) => {
                return exAcc + (ex.sets || []).reduce((setAcc, set) => {
                    return setAcc + ((set.weight || 0) * (set.reps || 0) * (set.completed ? 1 : 0));
                }, 0);
            }, 0);
        }, 0);

        // Find PRs for each exercise
        const prs = {};
        history.forEach(session => {
            (session.exercises || []).forEach(ex => {
                const exerciseId = ex.exercise_id || ex.exerciseId;
                if (!exerciseId) return;
                
                (ex.sets || []).forEach(set => {
                    if (set.completed && set.weight > 0) {
                        if (!prs[exerciseId] || set.weight > prs[exerciseId].weight) {
                            prs[exerciseId] = {
                                weight: set.weight,
                                reps: set.reps,
                                date: session.date,
                                exerciseName: ex.exercise_name || ex.exerciseName
                            };
                        }
                    }
                });
            });
        });

        return {
            totalSessions,
            totalVolume,
            prs: Object.entries(prs).map(([id, pr]) => ({ id, ...pr })).sort((a, b) => b.weight - a.weight)
        };
    }, [history]);

    return (
        <div className="pb-20 space-y-6">
            <h1 className="text-2xl font-bold">Estadísticas</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="bg-brand-card border-white/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar size={16} className="text-brand-lime" />
                        <span className="text-xs text-gray-400 uppercase">Sesiones</span>
                    </div>
                    <span className="text-3xl font-bold text-white">{stats.totalSessions}</span>
                </Card>
                <Card className="bg-brand-card border-white/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} className="text-brand-purple" />
                        <span className="text-xs text-gray-400 uppercase">Volumen Total</span>
                    </div>
                    <span className="text-3xl font-bold text-white">
                        {stats.totalVolume >= 1000 ? `${(stats.totalVolume / 1000).toFixed(1)}k` : stats.totalVolume}
                        <span className="text-sm text-gray-400 ml-1">kg</span>
                    </span>
                </Card>
            </div>

            {/* PRs Section */}
            {stats.prs.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Trophy size={18} className="text-yellow-500" />
                        <h2 className="text-sm font-bold text-white uppercase tracking-wide">Récords Personales</h2>
                    </div>
                    <div className="space-y-2">
                        {stats.prs.slice(0, 5).map((pr, i) => (
                            <Card key={pr.id} className="bg-brand-card border-white/5 p-3 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/10 text-gray-400'}`}>
                                        #{i + 1}
                                    </div>
                                    <span className="font-medium text-white">{pr.exerciseName || 'Ejercicio'}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-bold text-brand-lime">{pr.weight}kg</span>
                                    <span className="text-xs text-gray-400 ml-1">x{pr.reps}</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-1 bg-surface p-1 rounded-lg">
                <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'progress' ? 'bg-surface-light text-white' : 'text-text-secondary hover:text-text-primary'}`}
                    onClick={() => setActiveTab('progress')}
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
                {activeTab === 'progress' ? <ProgressChart /> : <HistoryList />}
            </div>
        </div>
    );
}
