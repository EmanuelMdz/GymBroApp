import React, { useState, useEffect } from 'react';
import { useWorkout } from '../../contexts/WorkoutContext';
import { useExercises } from '../../contexts/ExerciseContext';
import { SetRow } from './SetRow';
import { RestTimer } from './RestTimer';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Clock, ChevronLeft, ChevronRight, Pause, Weight, Dumbbell, Play } from 'lucide-react';
import { MUSCLE_GROUPS } from '../../data/models';
import { cn } from '../../utils/cn';

export function ActiveSession() {
    const { activeSession, updateSessionSet, finishSession, cancelSession } = useWorkout();
    const { getExerciseById } = useExercises();
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [showTimer, setShowTimer] = useState(true);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Timer logic for total elapsed time
    useEffect(() => {
        if (!activeSession) return;
        const interval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - activeSession.startTime) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [activeSession]);

    if (!activeSession) return null;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const currentExerciseSession = activeSession.exercises?.[currentExerciseIndex];

    if (!currentExerciseSession) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-4">
                <h2 className="text-xl font-bold text-brand-lime">Rutina Vacía</h2>
                <p className="text-gray-400">El día seleccionado no tiene ejercicios configurados.</p>
                <Button onClick={cancelSession} variant="destructive">
                    Cancelar Sesión
                </Button>
            </div>
        );
    }

    const currentExerciseDef = getExerciseById(currentExerciseSession.exerciseId);

    // Calculate current set (first uncompleted or last)
    const currentSetIndex = currentExerciseSession.sets.findIndex(s => !s.completed);
    const displaySetIndex = currentSetIndex === -1 ? currentExerciseSession.sets.length : currentSetIndex + 1;
    const totalSets = currentExerciseSession.sets.length;

    const handleSetUpdate = (setIndex, data) => {
        updateSessionSet(currentExerciseIndex, setIndex, data);
        if (data.completed === true) {
            setShowTimer(true); // Trigger rest timer
        }
    };

    const nextExercise = () => {
        if (currentExerciseIndex < activeSession.exercises.length - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
        }
    };

    const prevExercise = () => {
        if (currentExerciseIndex > 0) {
            setCurrentExerciseIndex(prev => prev - 1);
        }
    };

    return (
        <div className="pb-32 relative min-h-screen flex flex-col">
            {/* Immersive Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl font-bold">Tu Entrenamiento</h1>
                    <p className="text-xs text-brand-lime uppercase tracking-wider font-bold">
                        {activeSession.name || 'Sesión Actual'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="bg-white/10 text-white rounded-full h-10 w-10" onClick={cancelSession}>
                        <Pause size={20} fill="currentColor" />
                    </Button>
                </div>
            </div>

            {/* Exercise Visual / Main Card */}
            <div className="flex-1 flex flex-col gap-6">
                {/* Visual Placeholder */}
                <div className="relative h-[40vh] bg-neutral-800 rounded-[40px] overflow-hidden flex items-end p-6 border border-white/5 shadow-2xl">
                    {/* Placeholder Gradient/Image */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10" />
                    <div className={`absolute inset-0 bg-gradient-to-br from-brand-gray to-brand-card opacity-50 z-0`} />
                    {/* Pseudo-Gym Background */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-lime via-transparent to-transparent" />

                    <div className="relative z-20 w-full">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <span className="inline-block px-3 py-1 rounded-full bg-brand-lime text-brand-dark text-[10px] font-bold uppercase mb-2">
                                    {currentExerciseDef?.muscleGroup || 'General'}
                                </span>
                                <h2 className="text-3xl font-bold leading-tight max-w-[80%]">
                                    {currentExerciseDef?.name}
                                </h2>
                            </div>

                            {/* Floating Mini Stats */}
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center gap-1 min-w-[60px]">
                                <span className="text-[10px] text-gray-300 uppercase">Kcal</span>
                                <span className="text-lg font-bold">328</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Control Panel / Stats */}
                <Card className="flex-1 bg-brand-card border-t border-white/5 rounded-t-[40px] -mt-8 pt-10 pb-6 px-6 relative z-30">
                    {/* Handle bar */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-600 rounded-full" />

                    {/* Timer and Set Display */}
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Tiempo Transcurrido</span>
                            <div className="text-4xl font-mono font-bold text-white tracking-tight">
                                {formatTime(elapsedTime)}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-baseline justify-end gap-1">
                                <span className="text-4xl font-bold text-white">{displaySetIndex}</span>
                                <span className="text-xl text-gray-500 font-medium">/{totalSets}</span>
                            </div>
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Sets Completados</span>
                        </div>
                    </div>

                    {/* Current Exercise Sets */}
                    <div className="space-y-3 mb-8">
                        <div className="grid grid-cols-[30px_1fr_1fr_1fr_40px] gap-2 text-[10px] text-gray-500 uppercase font-bold text-center mb-2">
                            <span>#</span>
                            <span>Kg</span>
                            <span>Reps</span>
                            <span>RIR</span>
                            <span>OK</span>
                        </div>
                        {currentExerciseSession.sets.map((set, i) => (
                            <SetRow
                                key={i}
                                setNumber={set.setNumber}
                                weight={set.weight}
                                reps={set.reps}
                                rir={set.rir}
                                completed={set.completed}
                                onUpdate={(data) => handleSetUpdate(i, data)}
                                className={cn("py-3 rounded-2xl", set.completed ? "bg-brand-lime/10 border-brand-lime/20" : "bg-white/5")}
                            />
                        ))}
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-14 w-14 rounded-full bg-brand-gray text-white hover:bg-white/20"
                            onClick={prevExercise}
                            disabled={currentExerciseIndex === 0}
                        >
                            <ChevronLeft />
                        </Button>

                        <div className="flex-1">
                            {currentExerciseIndex === activeSession.exercises.length - 1 ? (
                                <Button className="w-full h-14 rounded-full text-base" onClick={finishSession}>
                                    Finalizar
                                </Button>
                            ) : (
                                <Button className="w-full h-14 rounded-full text-base" onClick={nextExercise}>
                                    Siguiente Ejercicio
                                </Button>
                            )}
                        </div>

                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-14 w-14 rounded-full bg-brand-gray text-white hover:bg-white/20"
                            onClick={nextExercise}
                            disabled={currentExerciseIndex === activeSession.exercises.length - 1}
                        >
                            <ChevronRight />
                        </Button>
                    </div>
                </Card>
            </div>

            {showTimer && <RestTimer className="fixed bottom-32 left-1/2 -translate-x-1/2 shadow-2xl z-50 scale-90" />}
        </div>
    );
}
