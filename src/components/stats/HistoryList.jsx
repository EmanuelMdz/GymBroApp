import React from 'react';
import { useWorkout } from '../../contexts/WorkoutContext';
import { Card } from '../common/Card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function HistoryList() {
    const { history } = useWorkout();

    if (history.length === 0) {
        return <div className="text-center text-text-secondary py-8">No hay sesiones registradas.</div>;
    }

    return (
        <div className="space-y-4">
            {history.map((session) => (
                <Card key={session.id} className="border-l-4 border-l-primary">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-bold text-text-primary capitalize">
                                {format(session.date, 'EEEE d MMMM', { locale: es })}
                            </h3>
                            <p className="text-xs text-text-secondary">{Math.round(session.duration)} min • {session.exercises.length} Ejercicios</p>
                        </div>
                        {/* <span className="text-xs bg-surface-light px-2 py-1 rounded">
                Vol: {session.exercises.reduce((acc, ex) => acc + ex.sets.reduce((sAcc, s) => sAcc + (s.weight * s.reps * (s.completed ? 1 : 0)), 0), 0)} kg
            </span> */}
                    </div>
                    <div className="space-y-1">
                        {session.exercises.map((ex, i) => (
                            <div key={i} className="text-sm flex justify-between border-b border-surface-light/50 last:border-0 py-1">
                                <span>{ex.exerciseName || 'Ejercicio'}</span>
                                <span className="text-text-secondary text-xs">
                                    {ex.sets.filter(s => s.completed).length} x {Math.max(...ex.sets.map(s => s.weight))}kg
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            ))}
        </div>
    );
}
