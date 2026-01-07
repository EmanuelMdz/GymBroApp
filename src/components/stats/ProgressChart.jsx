import React, { useState, useMemo } from 'react';
import { useWorkout } from '../../contexts/WorkoutContext';
import { useExercises } from '../../contexts/ExerciseContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '../common/Input';
import { Card } from '../common/Card';

export function ProgressChart() {
    const { history } = useWorkout();
    const { exercises } = useExercises();
    const [selectedExerciseId, setSelectedExerciseId] = useState(exercises[0]?.id || '');
    const [metric, setMetric] = useState('maxWeight'); // 'maxWeight' | 'volume'

    const data = useMemo(() => {
        if (!selectedExerciseId) return [];

        const exerciseHistory = history.filter(session =>
            session.exercises.some(ex => ex.exerciseId === selectedExerciseId)
        ).map(session => {
            const sessionExercise = session.exercises.find(ex => ex.exerciseId === selectedExerciseId);
            if (!sessionExercise) return null;

            let value = 0;
            if (metric === 'maxWeight') {
                value = Math.max(...sessionExercise.sets.filter(s => s.completed).map(s => s.weight), 0);
            } else if (metric === 'volume') {
                value = sessionExercise.sets.filter(s => s.completed).reduce((acc, s) => acc + (s.weight * s.reps), 0);
            }

            return {
                date: session.date,
                value: value,
                dateStr: format(session.date, 'd MMM', { locale: es })
            };
        }).filter(item => item && item.value > 0).reverse(); // History is usually new to old, chart needs old to new

        return exerciseHistory;
    }, [history, selectedExerciseId, metric]);

    if (exercises.length === 0) return <div>Agrega ejercicios para ver estadísticas.</div>;

    return (
        <Card className="p-4">
            <div className="mb-4 space-y-2">
                <select
                    className="w-full text-sm bg-surface border border-surface-light rounded p-2"
                    value={selectedExerciseId}
                    onChange={(e) => setSelectedExerciseId(e.target.value)}
                >
                    {exercises.map(ex => (
                        <option key={ex.id} value={ex.id}>{ex.name}</option>
                    ))}
                </select>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setMetric('maxWeight')}
                        className={`flex-1 text-xs py-1 rounded ${metric === 'maxWeight' ? 'bg-primary text-white' : 'bg-surface-light'}`}
                    >
                        Peso Máximo
                    </button>
                    <button
                        onClick={() => setMetric('volume')}
                        className={`flex-1 text-xs py-1 rounded ${metric === 'volume' ? 'bg-primary text-white' : 'bg-surface-light'}`}
                    >
                        Volumen Total
                    </button>
                </div>
            </div>

            <div className="h-64 w-full">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="dateStr" stroke="#888" fontSize={12} />
                            <YAxis stroke="#888" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-text-secondary text-sm">
                        No hay datos suficientes
                    </div>
                )}
            </div>
        </Card>
    );
}
