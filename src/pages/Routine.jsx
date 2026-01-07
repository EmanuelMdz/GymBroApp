import React, { useState } from 'react';
import { useWorkout } from '../contexts/WorkoutContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { DayConfig } from '../components/workout/DayConfig';
import { MUSCLE_GROUPS } from '../data/models';
import { useExercises } from '../contexts/ExerciseContext';
import { Clock, Dumbbell, ChevronRight } from 'lucide-react';

export default function Routine() {
    const { routine } = useWorkout();
    const { getExerciseById } = useExercises();
    const [selectedDay, setSelectedDay] = useState(null);

    return (
        <div className="pb-24 space-y-6">
            <header>
                <h1 className="text-xl font-bold mb-4">Tu Plan</h1>
                {/* Filter Pills - Mock functionality for UI feel */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <Button variant="ghost" className="bg-white text-black font-bold h-8 text-xs rounded-full px-4 hover:bg-white/90">
                        Todos
                    </Button>
                    <Button variant="ghost" className="bg-brand-gray text-gray-400 font-medium h-8 text-xs rounded-full px-4 hover:text-white">
                        Tren Inferior
                    </Button>
                    <Button variant="ghost" className="bg-brand-gray text-gray-400 font-medium h-8 text-xs rounded-full px-4 hover:text-white">
                        Tren Superior
                    </Button>
                </div>
            </header>

            <div className="grid gap-4">
                {routine.map((day, index) => {
                    const exerciseCount = day.exercises.length;
                    const estimatedDuration = exerciseCount * 5 + 10; // Mock calculation: 5 min/ex + 10 min warmpup

                    // Alternating gradients for variety
                    const gradients = [
                        "bg-gradient-to-br from-[#E0C8FF] to-[#D0B0FF] text-brand-dark",
                        "bg-gradient-to-br from-[#D4F064] to-[#C0E050] text-brand-dark",
                        "bg-brand-card border border-white/5 text-white"
                    ];
                    const cardStyle = day.exercises.length > 0 ? gradients[index % 2] : gradients[2];
                    const isDarkText = (index % 2) < 2 && day.exercises.length > 0;

                    return (
                        <Card
                            key={day.id}
                            className={`cursor-pointer transition-transform active:scale-[0.98] border-none p-0 overflow-hidden min-h-[140px] relative ${cardStyle}`}
                            onClick={() => setSelectedDay(day)}
                        >
                            <div className="p-6 h-full flex flex-col justify-between relative z-10">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">{day.name || 'Día de Descanso'}</h3>
                                    <p className={`text-xs font-medium uppercase tracking-wide opacity-70 ${isDarkText ? 'text-black' : 'text-gray-400'}`}>
                                        {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][day.dayOfWeek]}
                                    </p>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${isDarkText ? 'bg-white/30 backdrop-blur-sm text-black' : 'bg-brand-gray text-white'}`}>
                                        <Clock size={12} />
                                        {estimatedDuration} mins
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${isDarkText ? 'bg-white/30 backdrop-blur-sm text-black' : 'bg-brand-gray text-white'}`}>
                                        <Dumbbell size={12} />
                                        {exerciseCount} Ejercicios
                                    </div>
                                </div>
                            </div>

                            {/* Decorative graphics */}
                            <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-black skew-x-[-12deg] translate-x-4" />
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
