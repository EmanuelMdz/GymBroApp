import React, { useState, useMemo } from 'react';
import { useWorkout } from '../contexts/WorkoutContext';
import { useExercises } from '../contexts/ExerciseContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { DataManagement } from '../components/common/DataManagement';
import { Modal } from '../components/common/Modal';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Dumbbell, TrendingUp, Calendar, Trophy, Play, Clock } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

import { useAuth } from '../contexts/AuthContext';
import { User } from 'lucide-react';

export default function Home() {
    const { activeSession, startSession, routine, history } = useWorkout();
    const { exercises } = useExercises();
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isRoutineSelectorOpen, setIsRoutineSelectorOpen] = useState(false);

    const today = new Date();
    const startDate = startOfWeek(today, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    const todayRoutine = routine.find(d => d.day_of_week === today.getDay() || d.dayOfWeek === today.getDay());

    const userName = profile?.full_name || "Atleta";

    // Calculate weekly stats
    const weeklyStats = useMemo(() => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const weekSessions = history.filter(s => new Date(s.date) >= oneWeekAgo);
        const totalVolume = weekSessions.reduce((acc, session) => {
            return acc + (session.exercises || []).reduce((exAcc, ex) => {
                return exAcc + (ex.sets || []).reduce((setAcc, set) => {
                    return setAcc + ((set.weight || 0) * (set.reps || 0) * (set.completed ? 1 : 0));
                }, 0);
            }, 0);
        }, 0);
        
        const totalSets = weekSessions.reduce((acc, session) => {
            return acc + (session.exercises || []).reduce((exAcc, ex) => {
                return exAcc + (ex.sets || []).filter(s => s.completed).length;
            }, 0);
        }, 0);

        return {
            sessions: weekSessions.length,
            volume: totalVolume,
            sets: totalSets
        };
    }, [history]);

    // Format elapsed time for active session
    const formatElapsedTime = () => {
        if (!activeSession) return '00:00';
        const elapsed = Math.floor((Date.now() - activeSession.startTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6 pb-24">
            {/* Active Session Banner */}
            {activeSession && (
                <Card 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 border-none text-white p-4 cursor-pointer animate-pulse-slow"
                    onClick={() => navigate('/session')}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <Play size={24} className="text-white ml-1" />
                            </div>
                            <div>
                                <p className="text-xs font-medium opacity-80 uppercase">Entrenamiento en curso</p>
                                <h3 className="font-bold text-lg">{activeSession.dayName}</h3>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1 text-white/80">
                                <Clock size={14} />
                                <span className="font-mono text-sm">{formatElapsedTime()}</span>
                            </div>
                            <p className="text-xs opacity-80">{activeSession.exercises.length} ejercicios</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Header */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold font-sans">Hola {userName}</h1>
                    <p className="text-brand-lime text-xs font-medium uppercase tracking-wider">Levanta Pesado 💪</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full bg-brand-gray/50 text-white" onClick={() => setIsSettingsOpen(true)}>
                    <User size={20} />
                </Button>
            </header>

            {/* Calendar Strip */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <span className="text-white font-medium text-lg capitalize">{format(today, 'MMMM yyyy', { locale: es })}</span>
                    <div className="flex space-x-2">
                        <button className="p-1 rounded-full bg-brand-gray/50 hover:bg-brand-gray text-white"><ChevronLeft size={16} /></button>
                        <button className="p-1 rounded-full bg-brand-gray/50 hover:bg-brand-gray text-white"><ChevronRight size={16} /></button>
                    </div>
                </div>
                <div className="flex justify-between items-center bg-brand-card p-4 rounded-[32px] border border-white/5">
                    {weekDays.map((date) => {
                        const isToday = isSameDay(date, today);
                        const isActive = routine.some(r => r.dayOfWeek === date.getDay());
                        return (
                            <div key={date.toString()} className="flex flex-col items-center gap-2">
                                <span className="text-[10px] text-gray-400 font-medium uppercase">{format(date, 'EEEEE', { locale: es })}</span>
                                <div className={`h-8 w-8 flex items-center justify-center rounded-full text-sm font-bold transition-all ${isToday ? 'bg-brand-lime text-brand-dark shadow-[0_0_15px_rgba(212,240,100,0.4)]' : 'text-white'}`}>
                                    {format(date, 'd')}
                                </div>
                                {isActive && !isToday && <div className="h-1 w-1 rounded-full bg-brand-purple" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Today's Challenge / Routine */}
            <Card className="bg-gradient-to-r from-[#D4F064] to-[#C0E050] border-none text-brand-dark relative overflow-hidden group">
                <div className="relative z-10 flex flex-col items-start gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">Reto de Hoy</span>
                    <h3 className="text-2xl font-bold leading-tight max-w-[70%]">
                        {todayRoutine ? todayRoutine.name : "Día de Descanso"}
                    </h3>
                    <p className="text-sm font-medium opacity-70 mb-4">
                        {todayRoutine ? `${todayRoutine.exercises.length} ejercicios para hoy` : "Recupera energías"}
                    </p>
                    <div className="flex gap-2">
                        {todayRoutine && todayRoutine.exercises.length > 0 ? (
                            <Button
                                className="bg-brand-dark text-white hover:bg-black border-none h-10 px-6 rounded-full text-xs"
                                onClick={() => startSession(todayRoutine.id)}
                            >
                                Comenzar
                            </Button>
                        ) : (
                            <Button
                                className="bg-brand-dark text-white hover:bg-black border-none h-10 px-6 rounded-full text-xs"
                                onClick={() => navigate('/routine')}
                            >
                                {todayRoutine ? 'Añadir Ejercicios' : 'Crear Rutina'}
                            </Button>
                        )}
                        <Button
                            className="bg-brand-dark/50 text-white hover:bg-black/50 border-none h-10 px-4 rounded-full text-xs"
                            onClick={() => setIsRoutineSelectorOpen(true)}
                        >
                            Otra Rutina
                        </Button>
                    </div>
                </div>
                {/* Decorative Icon */}
                <div className="absolute right-[-20px] bottom-[-20px] opacity-20 rotate-12">
                    <Dumbbell size={120} className="text-brand-dark" />
                </div>
            </Card>

            {/* Weekly Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                <Card className="bg-brand-card border-white/5 p-4 text-center">
                    <Calendar size={20} className="mx-auto mb-2 text-brand-lime" />
                    <span className="text-2xl font-bold text-white">{weeklyStats.sessions}</span>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Sesiones</p>
                </Card>
                <Card className="bg-brand-card border-white/5 p-4 text-center">
                    <Dumbbell size={20} className="mx-auto mb-2 text-brand-purple" />
                    <span className="text-2xl font-bold text-white">{weeklyStats.sets}</span>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Series</p>
                </Card>
                <Card className="bg-brand-card border-white/5 p-4 text-center">
                    <TrendingUp size={20} className="mx-auto mb-2 text-green-400" />
                    <span className="text-2xl font-bold text-white">{weeklyStats.volume >= 1000 ? `${(weeklyStats.volume / 1000).toFixed(1)}k` : weeklyStats.volume}</span>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Kg Vol.</p>
                </Card>
            </div>

            {/* Quick Access to Routine Days - Show ALL */}
            {routine.length > 0 && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="text-sm font-bold text-white uppercase tracking-wide">Tu Semana</h2>
                        <Button variant="ghost" size="sm" className="text-brand-lime text-xs" onClick={() => navigate('/routine')}>
                            Editar
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {routine.filter(day => day.exercises && day.exercises.length > 0).map((day, idx) => {
                            // Check if this day was completed this week
                            const oneWeekAgo = new Date();
                            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                            const wasCompletedThisWeek = history.some(s => 
                                s.workoutDayId === day.id && new Date(s.date) >= oneWeekAgo
                            );
                            
                            return (
                                <Card 
                                    key={day.id} 
                                    className={`border-white/5 p-3 flex justify-between items-center cursor-pointer transition-colors ${
                                        wasCompletedThisWeek 
                                            ? 'bg-green-500/10 border-green-500/20' 
                                            : 'bg-brand-card hover:bg-brand-gray/50'
                                    }`}
                                    onClick={() => !wasCompletedThisWeek && startSession(day.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                            wasCompletedThisWeek ? 'bg-green-500/20' : 'bg-brand-lime/20'
                                        }`}>
                                            {wasCompletedThisWeek ? (
                                                <span className="text-green-500 text-lg">✓</span>
                                            ) : (
                                                <span className="text-brand-lime font-bold text-sm">{idx + 1}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className={`font-medium text-sm ${wasCompletedThisWeek ? 'text-gray-400 line-through' : 'text-white'}`}>
                                                {day.name}
                                            </h3>
                                            <p className="text-[11px] text-gray-500">{day.exercises.length} ejercicios</p>
                                        </div>
                                    </div>
                                    {wasCompletedThisWeek ? (
                                        <span className="text-[10px] text-green-500 font-medium">Completado</span>
                                    ) : (
                                        <Button size="sm" className="bg-brand-lime text-brand-dark hover:bg-brand-lime/90 rounded-full px-3 text-[11px] font-bold h-8">
                                            Iniciar
                                        </Button>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Empty State - No exercises configured */}
            {routine.every(day => !day.exercises || day.exercises.length === 0) && (
                <Card className="bg-brand-card border-white/5 p-6 text-center">
                    <Dumbbell size={40} className="mx-auto mb-3 text-gray-500" />
                    <h3 className="font-bold text-white mb-1">Configura tu rutina</h3>
                    <p className="text-sm text-gray-400 mb-4">Agrega ejercicios a tus días para empezar a entrenar</p>
                    <Button onClick={() => navigate('/routine')} className="bg-brand-lime text-brand-dark hover:bg-brand-lime/90">
                        Crear Rutina
                    </Button>
                </Card>
            )}

            {/* Routine Selector Modal */}
            <Modal
                isOpen={isRoutineSelectorOpen}
                onClose={() => setIsRoutineSelectorOpen(false)}
                title="Seleccionar Rutina"
            >
                <div className="space-y-3">
                    <p className="text-sm text-gray-400 mb-4">¿Qué rutina querés entrenar hoy?</p>
                    {routine.filter(day => day.exercises && day.exercises.length > 0).map(day => (
                        <button
                            key={day.id}
                            onClick={() => {
                                startSession(day.id);
                                setIsRoutineSelectorOpen(false);
                            }}
                            className="w-full p-4 bg-brand-gray/30 hover:bg-brand-gray/50 rounded-xl text-left transition-colors flex justify-between items-center"
                        >
                            <div>
                                <h3 className="font-semibold text-white">{day.name}</h3>
                                <p className="text-xs text-gray-400">{day.exercises.length} ejercicios</p>
                            </div>
                            <Dumbbell size={20} className="text-brand-lime" />
                        </button>
                    ))}
                </div>
            </Modal>

            <Modal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                title="Ajustes"
            >
                <div className="space-y-6">
                    <div className="bg-brand-gray/30 p-4 rounded-xl flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-brand-lime text-brand-dark flex items-center justify-center font-bold text-xl">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-white font-bold">{userName}</p>
                            <p className="text-xs text-gray-400">{profile?.username || 'Usuario'}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-2">Gestión de Datos</h3>
                        <DataManagement />
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <Button
                            className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                            onClick={signOut}
                        >
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
