import React, { useState, useMemo } from 'react';
import { useWorkout } from '../contexts/WorkoutContext';
import { useExercises } from '../contexts/ExerciseContext';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, subDays, subWeeks, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trophy, TrendingUp, Dumbbell, Calendar, ChevronRight, Flame, Target } from 'lucide-react';

// Time range filters
const TIME_RANGES = [
    { key: '3d', label: '3 días', days: 3 },
    { key: '7d', label: '7 días', days: 7 },
    { key: '2w', label: '2 sem', days: 14 },
    { key: '1m', label: '1 mes', days: 30 },
    { key: '3m', label: '3 meses', days: 90 },
    { key: '6m', label: '6 meses', days: 180 },
    { key: 'all', label: 'Todo', days: 9999 },
];

// Big 3 exercises (basics)
const BIG_THREE = ['Sentadilla con Barra', 'Bench Press', 'Peso Muerto', 'Peso Muerto Rumano'];

export default function Stats() {
    const [activeTab, setActiveTab] = useState('progress');
    const [timeRange, setTimeRange] = useState('7d');
    const [selectedPR, setSelectedPR] = useState(null);
    const { history } = useWorkout();
    const { exercises, getExerciseById } = useExercises();

    // Filter history by time range
    const filteredHistory = useMemo(() => {
        const range = TIME_RANGES.find(r => r.key === timeRange);
        const cutoffDate = range.days === 9999 ? new Date(0) : subDays(new Date(), range.days);
        return history.filter(s => new Date(s.date) >= cutoffDate);
    }, [history, timeRange]);

    // Calculate stats for filtered period
    const stats = useMemo(() => {
        const totalSessions = filteredHistory.length;
        
        let totalVolume = 0;
        let totalSets = 0;
        
        filteredHistory.forEach(session => {
            (session.exercises || []).forEach(ex => {
                (ex.sets || []).forEach(set => {
                    if (set.completed) {
                        totalVolume += (set.weight || 0) * (set.reps || 0);
                        totalSets++;
                    }
                });
            });
        });

        // Find PRs for each exercise (from ALL history, not filtered)
        const prs = {};
        history.forEach(session => {
            (session.exercises || []).forEach(ex => {
                const exerciseId = ex.exercise_id || ex.exerciseId;
                const exerciseName = ex.exercise_name || ex.exerciseName || 'Ejercicio';
                if (!exerciseId) return;
                
                (ex.sets || []).forEach(set => {
                    if (set.completed && set.weight > 0) {
                        if (!prs[exerciseId] || set.weight > prs[exerciseId].weight) {
                            prs[exerciseId] = {
                                weight: set.weight,
                                reps: set.reps,
                                date: session.date,
                                exerciseName,
                                exerciseId
                            };
                        }
                    }
                });
            });
        });

        // Separate Big 3 from others
        const allPRs = Object.entries(prs).map(([id, pr]) => ({ id, ...pr }));
        const bigThreePRs = allPRs.filter(pr => BIG_THREE.some(name => pr.exerciseName?.includes(name)));
        const otherPRs = allPRs.filter(pr => !BIG_THREE.some(name => pr.exerciseName?.includes(name))).sort((a, b) => b.weight - a.weight);

        return {
            totalSessions,
            totalVolume,
            totalSets,
            bigThreePRs,
            otherPRs
        };
    }, [filteredHistory, history]);

    // Volume over time chart data (general, not per exercise)
    const volumeChartData = useMemo(() => {
        return filteredHistory.map(session => {
            let sessionVolume = 0;
            (session.exercises || []).forEach(ex => {
                (ex.sets || []).forEach(set => {
                    if (set.completed) {
                        sessionVolume += (set.weight || 0) * (set.reps || 0);
                    }
                });
            });
            return {
                date: session.date,
                dateStr: format(new Date(session.date), 'd MMM', { locale: es }),
                volume: sessionVolume,
                sessions: 1
            };
        }).reverse();
    }, [filteredHistory]);

    // PR detail data (history for selected exercise)
    const prDetailData = useMemo(() => {
        if (!selectedPR) return { maxWeightData: [], volumeData: [] };
        
        const exerciseId = selectedPR.exerciseId || selectedPR.id;
        const exerciseHistory = history.filter(session =>
            (session.exercises || []).some(ex => 
                (ex.exercise_id || ex.exerciseId) === exerciseId
            )
        ).map(session => {
            const ex = (session.exercises || []).find(e => 
                (e.exercise_id || e.exerciseId) === exerciseId
            );
            if (!ex) return null;
            
            const completedSets = (ex.sets || []).filter(s => s.completed);
            const maxWeight = Math.max(...completedSets.map(s => s.weight || 0), 0);
            const volume = completedSets.reduce((acc, s) => acc + ((s.weight || 0) * (s.reps || 0)), 0);
            
            return {
                date: session.date,
                dateStr: format(new Date(session.date), 'd MMM', { locale: es }),
                maxWeight,
                volume
            };
        }).filter(Boolean).reverse();
        
        return { exerciseHistory };
    }, [selectedPR, history]);

    return (
        <div className="pb-24 space-y-4">
            <h1 className="text-xl font-bold">Estadísticas</h1>

            {/* Time Range Filter */}
            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                {TIME_RANGES.map(range => (
                    <button
                        key={range.key}
                        onClick={() => setTimeRange(range.key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                            timeRange === range.key 
                                ? 'bg-brand-lime text-brand-dark' 
                                : 'bg-brand-card text-gray-400 hover:text-white'
                        }`}
                    >
                        {range.label}
                    </button>
                ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-2">
                <Card className="bg-brand-card border-white/5 p-3">
                    <Calendar size={14} className="text-brand-lime mb-1" />
                    <span className="text-2xl font-bold text-white block">{stats.totalSessions}</span>
                    <p className="text-[10px] text-gray-400 uppercase">Sesiones</p>
                </Card>
                <Card className="bg-brand-card border-white/5 p-3">
                    <Target size={14} className="text-brand-purple mb-1" />
                    <span className="text-2xl font-bold text-white block">{stats.totalSets}</span>
                    <p className="text-[10px] text-gray-400 uppercase">Series</p>
                </Card>
                <Card className="bg-brand-card border-white/5 p-3">
                    <TrendingUp size={14} className="text-green-400 mb-1" />
                    <span className="text-2xl font-bold text-white block">
                        {stats.totalVolume >= 1000 ? `${(stats.totalVolume / 1000).toFixed(0)}k` : stats.totalVolume}
                    </span>
                    <p className="text-[10px] text-gray-400 uppercase">Kg Vol</p>
                </Card>
            </div>

            {/* Volume Chart (General) */}
            <Card className="bg-brand-card border-white/5 p-4">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <TrendingUp size={16} className="text-brand-lime" />
                    Volumen por Sesión
                </h3>
                <div className="h-40">
                    {volumeChartData.length >= 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={volumeChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="dateStr" stroke="#666" fontSize={10} tickLine={false} />
                                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                    labelStyle={{ color: '#fff' }}
                                    formatter={(value) => [`${value.toLocaleString()} kg`, 'Volumen']}
                                />
                                <Bar dataKey="volume" fill="#D4F064" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                            Necesitas más sesiones para ver el gráfico
                        </div>
                    )}
                </div>
            </Card>

            {/* Big 3 PRs */}
            {stats.bigThreePRs.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Flame size={16} className="text-orange-500" />
                        <h2 className="text-sm font-bold text-white uppercase tracking-wide">Los Básicos</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {stats.bigThreePRs.map((pr, i) => (
                            <Card 
                                key={pr.id} 
                                className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 p-3 flex justify-between items-center cursor-pointer hover:from-orange-500/30 hover:to-red-500/30 transition-all"
                                onClick={() => setSelectedPR(pr)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/30 flex items-center justify-center">
                                        <Dumbbell size={18} className="text-orange-400" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-white text-sm">{pr.exerciseName}</span>
                                        <p className="text-[10px] text-gray-400">
                                            {format(new Date(pr.date), 'd MMM yyyy', { locale: es })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-right">
                                        <span className="text-xl font-bold text-orange-400">{pr.weight}kg</span>
                                        <span className="text-xs text-gray-400 ml-1">x{pr.reps}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-500" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Other PRs */}
            {stats.otherPRs.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-yellow-500" />
                        <h2 className="text-sm font-bold text-white uppercase tracking-wide">Otros Récords</h2>
                    </div>
                    <div className="space-y-1">
                        {stats.otherPRs.slice(0, 8).map((pr, i) => (
                            <Card 
                                key={pr.id} 
                                className="bg-brand-card border-white/5 p-2.5 flex justify-between items-center cursor-pointer hover:bg-brand-gray/50 transition-colors"
                                onClick={() => setSelectedPR(pr)}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                                        i === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/10 text-gray-500'
                                    }`}>
                                        #{i + 1}
                                    </div>
                                    <span className="font-medium text-white text-sm">{pr.exerciseName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-brand-lime">{pr.weight}kg</span>
                                    <span className="text-[10px] text-gray-500">x{pr.reps}</span>
                                    <ChevronRight size={14} className="text-gray-600" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs for Progress/History */}
            <div className="flex bg-brand-card rounded-xl p-1">
                <button
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === 'progress' ? 'bg-brand-lime text-brand-dark' : 'text-gray-400'
                    }`}
                    onClick={() => setActiveTab('progress')}
                >
                    Progreso
                </button>
                <button
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === 'history' ? 'bg-brand-lime text-brand-dark' : 'text-gray-400'
                    }`}
                    onClick={() => setActiveTab('history')}
                >
                    Historial
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'history' && (
                <div className="space-y-3">
                    {filteredHistory.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">No hay sesiones en este período</div>
                    ) : (
                        filteredHistory.map(session => {
                            const sessionVolume = (session.exercises || []).reduce((acc, ex) => 
                                acc + (ex.sets || []).reduce((sAcc, s) => 
                                    sAcc + ((s.completed ? (s.weight || 0) * (s.reps || 0) : 0)), 0), 0);
                            
                            return (
                                <Card key={session.id} className="bg-brand-card border-white/5 border-l-4 border-l-brand-lime p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-white capitalize text-sm">
                                                {format(new Date(session.date), 'EEEE d MMMM', { locale: es })}
                                            </h3>
                                            <p className="text-[11px] text-gray-400">
                                                {Math.round(session.duration || 0)} min • {(session.exercises || []).length} ejercicios
                                            </p>
                                        </div>
                                        <span className="text-xs bg-brand-lime/20 text-brand-lime px-2 py-1 rounded-full font-medium">
                                            {sessionVolume.toLocaleString()} kg
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        {(session.exercises || []).map((ex, i) => {
                                            const exName = ex.exercise_name || ex.exerciseName || 'Ejercicio';
                                            const completedSets = (ex.sets || []).filter(s => s.completed);
                                            const maxWeight = Math.max(...completedSets.map(s => s.weight || 0), 0);
                                            
                                            return (
                                                <div key={i} className="text-xs flex justify-between py-1 border-b border-white/5 last:border-0">
                                                    <span className="text-gray-300">{exName}</span>
                                                    <span className="text-gray-500">
                                                        {completedSets.length} x {maxWeight}kg
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>
            )}

            {activeTab === 'progress' && (
                <Card className="bg-brand-card border-white/5 p-4">
                    <p className="text-sm text-gray-400 text-center">
                        Selecciona un récord personal arriba para ver su progresión detallada
                    </p>
                </Card>
            )}

            {/* PR Detail Modal */}
            <Modal
                isOpen={!!selectedPR}
                onClose={() => setSelectedPR(null)}
                title={selectedPR?.exerciseName || 'Detalle'}
            >
                {selectedPR && prDetailData.exerciseHistory && (
                    <div className="space-y-4">
                        {/* Current PR */}
                        <div className="text-center py-4 bg-brand-lime/10 rounded-xl">
                            <p className="text-xs text-gray-400 uppercase mb-1">Récord Personal</p>
                            <span className="text-4xl font-bold text-brand-lime">{selectedPR.weight}kg</span>
                            <span className="text-lg text-gray-400 ml-2">x{selectedPR.reps}</span>
                            <p className="text-xs text-gray-500 mt-1">
                                {format(new Date(selectedPR.date), 'd MMMM yyyy', { locale: es })}
                            </p>
                        </div>

                        {/* Max Weight Chart */}
                        <div>
                            <h4 className="text-sm font-bold text-white mb-2">Peso Máximo</h4>
                            <div className="h-40 bg-brand-dark/50 rounded-xl p-2">
                                {prDetailData.exerciseHistory.length >= 1 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={prDetailData.exerciseHistory}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                            <XAxis dataKey="dateStr" stroke="#666" fontSize={10} />
                                            <YAxis stroke="#666" fontSize={10} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                                formatter={(value) => [`${value} kg`, 'Peso']}
                                            />
                                            <Line type="monotone" dataKey="maxWeight" stroke="#D4F064" strokeWidth={2} dot={{ r: 3 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                                        Necesitas más datos
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Volume Chart */}
                        <div>
                            <h4 className="text-sm font-bold text-white mb-2">Volumen por Sesión</h4>
                            <div className="h-40 bg-brand-dark/50 rounded-xl p-2">
                                {prDetailData.exerciseHistory.length >= 1 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={prDetailData.exerciseHistory}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                            <XAxis dataKey="dateStr" stroke="#666" fontSize={10} />
                                            <YAxis stroke="#666" fontSize={10} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                                formatter={(value) => [`${value} kg`, 'Volumen']}
                                            />
                                            <Bar dataKey="volume" fill="#A78BFA" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                                        Necesitas más datos
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* History List */}
                        <div>
                            <h4 className="text-sm font-bold text-white mb-2">Historial</h4>
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                                {prDetailData.exerciseHistory.slice().reverse().map((entry, i) => (
                                    <div key={i} className="flex justify-between text-xs py-1.5 border-b border-white/5">
                                        <span className="text-gray-400">{entry.dateStr}</span>
                                        <span className="text-white">{entry.maxWeight}kg • {entry.volume}kg vol</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
