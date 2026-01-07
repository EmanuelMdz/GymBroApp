import React, { useState } from 'react';
import { useWorkout } from '../contexts/WorkoutContext';
import { ActiveSession } from '../components/workout/ActiveSession';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressRing } from '../components/common/ProgressRing';
import { DataManagement } from '../components/common/DataManagement';
import { Modal } from '../components/common/Modal';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft, ChevronRight, Footprints, Flame, Info } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

import { useAuth } from '../contexts/AuthContext';
import { User } from 'lucide-react';

export default function Home() {
    const { activeSession, startSession, routine } = useWorkout();
    const { profile, signOut } = useAuth(); // Get profile and signOut
    const navigate = useNavigate();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const today = new Date();
    const startDate = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    const todayRoutine = routine.find(d => d.dayOfWeek === today.getDay());

    // Use profile name or fallback to email fragment
    const userName = profile?.full_name || "Atleta";

    if (activeSession) {
        return <ActiveSession />;
    }

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold font-sans">Hola {userName}</h1>
                    <p className="text-brand-lime text-xs font-medium uppercase tracking-wider">Fitness Freak</p>
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
                </div>
                {/* Decorative Image Placeholder or Icon */}
                <div className="absolute right-[-20px] bottom-[-20px] opacity-20 rotate-12">
                    <Flame size={120} className="text-brand-dark" />
                </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Steps Card */}
                <Card className="bg-[#E0C8FF] border-none text-brand-dark p-5">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm">Pasos</span>
                        <Footprints size={18} className="opacity-50" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-bold">1,840</span>
                        <span className="text-[10px] font-medium opacity-60">Objetivo: 6,000</span>
                    </div>
                    <div className="mt-4 h-2 w-full bg-black/10 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-dark w-[30%] rounded-full" />
                    </div>
                </Card>

                {/* Goals Card */}
                <Card className="bg-brand-card border-white/5 p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm text-white">Mis Metas</span>
                            <span className="bg-brand-lime text-brand-dark text-[10px] font-bold px-2 py-0.5 rounded-full">42%</span>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-tight">Sigue así, puedes lograrlo.</p>
                    </div>
                    <div className="flex justify-center mt-2">
                        {/* Placeholder for small chart or visual */}
                        <div className="flex -space-x-2">
                            <div className="h-8 w-8 rounded-full bg-brand-lime border-2 border-brand-card" />
                            <div className="h-8 w-8 rounded-full bg-brand-purple border-2 border-brand-card" />
                            <div className="h-8 w-8 rounded-full bg-white border-2 border-brand-card flex items-center justify-center text-[10px] font-bold text-brand-dark">+2</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Calories / Rings */}
            <Card className="bg-brand-card border-white/5 p-6 flex items-center justify-between">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-lime" />
                        <div>
                            <p className="text-xs text-gray-400">Objetivo</p>
                            <p className="text-sm font-bold text-white">2000 Kcal</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-purple" />
                        <div>
                            <p className="text-xs text-gray-400">Quemadas</p>
                            <p className="text-sm font-bold text-white">872 Kcal</p>
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <ProgressRing size={100} strokeWidth={8} progress={75} color="text-brand-lime" trackColor="text-brand-gray" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-brand-purple w-2 h-2 rounded-full absolute top-2 right-4 shadow-lg shadow-brand-purple" /> {/* Decorative dot */}
                        <ProgressRing size={70} strokeWidth={8} progress={42} color="text-brand-purple" trackColor="text-transparent" className="absolute" />
                    </div>
                </div>
            </Card>

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
