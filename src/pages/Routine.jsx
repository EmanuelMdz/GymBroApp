import React, { useState } from 'react';
import { useWorkout } from '../contexts/WorkoutContext';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { DayConfig } from '../components/workout/DayConfig';
import { useExercises } from '../contexts/ExerciseContext';
import { Clock, Dumbbell } from 'lucide-react';

// Color palette by routine type
const ROUTINE_COLORS = {
    lower: { bg: 'from-red-500 to-red-600', text: 'text-white', label: 'Pierna' },
    upper: { bg: 'from-blue-500 to-blue-600', text: 'text-white', label: 'Upper' },
    push: { bg: 'from-cyan-400 to-cyan-500', text: 'text-brand-dark', label: 'Empuje' },
    pull: { bg: 'from-purple-500 to-purple-600', text: 'text-white', label: 'Jalón' },
    arms: { bg: 'from-orange-400 to-orange-500', text: 'text-brand-dark', label: 'Brazos' },
    chest: { bg: 'from-sky-400 to-sky-500', text: 'text-brand-dark', label: 'Pecho' },
    back: { bg: 'from-indigo-500 to-indigo-600', text: 'text-white', label: 'Espalda' },
    shoulders: { bg: 'from-pink-500 to-pink-600', text: 'text-white', label: 'Hombros' },
    rest: { bg: 'from-gray-700 to-gray-800', text: 'text-gray-300', label: 'Descanso' },
    default: { bg: 'from-brand-lime to-[#C0E050]', text: 'text-brand-dark', label: '' }
};

const detectRoutineType = (name) => {
    if (!name) return 'rest';
    const lower = name.toLowerCase();
    if (lower.includes('lower') || lower.includes('pierna') || lower.includes('leg')) return 'lower';
    if (lower.includes('upper')) return 'upper';
    if (lower.includes('push') || lower.includes('empuje') || lower.includes('pecho')) return 'push';
    if (lower.includes('pull') || lower.includes('jalón') || lower.includes('jalon') || lower.includes('espalda')) return 'pull';
    if (lower.includes('brazo') || lower.includes('arm') || lower.includes('bíceps') || lower.includes('tríceps')) return 'arms';
    if (lower.includes('hombro') || lower.includes('shoulder') || lower.includes('deltoid')) return 'shoulders';
    return 'default';
};

export default function Routine() {
    const { routine } = useWorkout();
    const { getExerciseById } = useExercises();
    const [selectedDay, setSelectedDay] = useState(null);

    // Filter only days with exercises for numbering
    const activeDays = routine.filter(d => d.exercises && d.exercises.length > 0);

    return (
        <div className="pb-24 space-y-4">
            <header>
                <h1 className="text-xl font-bold mb-2">Tu Plan</h1>
                <p className="text-sm text-gray-400">{activeDays.length} días de entrenamiento</p>
            </header>

            <div className="space-y-3">
                {routine.map((day, index) => {
                    const exerciseCount = day.exercises?.length || 0;
                    const estimatedDuration = exerciseCount * 5 + 10;
                    const routineType = detectRoutineType(day.name);
                    const colors = ROUTINE_COLORS[routineType];
                    const dayNumber = activeDays.findIndex(d => d.id === day.id) + 1;
                    const isRestDay = exerciseCount === 0;

                    return (
                        <Card
                            key={day.id}
                            className={`cursor-pointer transition-all active:scale-[0.98] border-none p-0 overflow-hidden relative bg-gradient-to-r ${colors.bg}`}
                            onClick={() => setSelectedDay(day)}
                        >
                            <div className={`p-4 flex items-center gap-4 ${colors.text}`}>
                                {/* Day Number */}
                                {!isRestDay && (
                                    <div className="w-12 h-12 rounded-xl bg-black/20 flex flex-col items-center justify-center flex-shrink-0">
                                        <span className="text-[10px] font-medium opacity-70">DÍA</span>
                                        <span className="text-xl font-bold leading-none">{dayNumber}</span>
                                    </div>
                                )}
                                
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {colors.label && (
                                            <span className="text-[10px] font-bold uppercase bg-black/20 px-2 py-0.5 rounded">
                                                {colors.label}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-base truncate">{day.name || 'Día de Descanso'}</h3>
                                    <div className="flex items-center gap-3 mt-1 opacity-80">
                                        <span className="text-xs flex items-center gap-1">
                                            <Clock size={12} />
                                            {estimatedDuration} min
                                        </span>
                                        <span className="text-xs flex items-center gap-1">
                                            <Dumbbell size={12} />
                                            {exerciseCount} ejercicios
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Modal
                isOpen={!!selectedDay}
                onClose={() => setSelectedDay(null)}
                title={selectedDay?.name || 'Configurar Día'}
            >
                {selectedDay && <DayConfig day={selectedDay} onClose={() => setSelectedDay(null)} />}
            </Modal>
        </div>
    );
}
