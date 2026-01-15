import React, { useState, useEffect } from 'react';
import { useWorkout } from '../contexts/WorkoutContext';
import { useExercises } from '../contexts/ExerciseContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { 
    ChevronDown, 
    ChevronUp, 
    Check, 
    Clock, 
    X, 
    Plus, 
    RefreshCw,
    Search,
    Home,
    CheckCircle2
} from 'lucide-react';

export default function Session() {
    const { 
        activeSession, 
        updateSessionSet, 
        addSetToExercise, 
        saveExerciseToDb,
        addExerciseToSession,
        replaceExerciseInSession,
        finishSession, 
        cancelSession 
    } = useWorkout();
    const { exercises, getExerciseById } = useExercises();
    const navigate = useNavigate();
    
    const [expandedExercise, setExpandedExercise] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showReplaceModal, setShowReplaceModal] = useState(null); // exerciseIndex to replace
    const [showAddModal, setShowAddModal] = useState(false);
    const [showFinishConfirm, setShowFinishConfirm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Timer
    useEffect(() => {
        if (!activeSession) return;
        const interval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - activeSession.startTime) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [activeSession]);

    // Redirect if no active session
    useEffect(() => {
        if (!activeSession) {
            navigate('/');
        }
    }, [activeSession, navigate]);

    if (!activeSession) return null;

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleExercise = (index) => {
        setExpandedExercise(expandedExercise === index ? null : index);
    };

    const getExerciseProgress = (exercise) => {
        const completed = exercise.sets.filter(s => s.completed).length;
        const total = exercise.sets.length;
        return { completed, total, percent: total > 0 ? (completed / total) * 100 : 0 };
    };

    const getTotalProgress = () => {
        let completed = 0;
        let total = 0;
        activeSession.exercises.forEach(ex => {
            const progress = getExerciseProgress(ex);
            completed += progress.completed;
            total += progress.total;
        });
        return { completed, total, percent: total > 0 ? (completed / total) * 100 : 0 };
    };

    const handleFinish = async () => {
        await finishSession();
        navigate('/');
    };

    const handleCancel = () => {
        cancelSession();
        navigate('/');
    };

    const filteredExercises = exercises.filter(ex => 
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !activeSession.exercises.some(ae => ae.exerciseId === ex.id)
    ).slice(0, 15);

    const totalProgress = getTotalProgress();

    return (
        <div className="min-h-screen pb-44">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-brand-dark/95 backdrop-blur-sm pb-4">
                <div className="flex items-center justify-between mb-4">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <Home size={20} />
                        <span className="text-sm">Inicio</span>
                    </button>
                    <button 
                        onClick={() => setShowFinishConfirm(true)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                        Cancelar
                    </button>
                </div>

                {/* Session Info - Compact */}
                <div className="bg-brand-card rounded-xl p-3 border border-white/5">
                    <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-brand-lime font-medium uppercase">En curso</p>
                            <h1 className="text-base font-bold text-white truncate">{activeSession.dayName}</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-white">
                                    <Clock size={14} className="text-brand-lime" />
                                    <span className="font-mono text-base font-bold">{formatTime(elapsedTime)}</span>
                                </div>
                                <p className="text-[10px] text-gray-400">{totalProgress.completed}/{totalProgress.total} series</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                <span className="text-xs font-bold text-brand-lime">{Math.round(totalProgress.percent)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-2 mt-3">
                {activeSession.exercises.map((exercise, exIndex) => {
                    const exDef = getExerciseById(exercise.exerciseId);
                    const progress = getExerciseProgress(exercise);
                    const isExpanded = expandedExercise === exIndex;
                    const isComplete = progress.completed === progress.total && progress.total > 0;

                    return (
                        <div 
                            key={exIndex}
                            className={`bg-brand-card rounded-xl border transition-all duration-200 ${
                                isExpanded ? 'border-brand-lime/50' : 'border-white/5'
                            } ${isComplete ? 'opacity-50' : ''}`}
                        >
                            {/* Exercise Header - Clickable */}
                            <button
                                onClick={() => toggleExercise(exIndex)}
                                className="w-full p-3 flex items-center justify-between text-left"
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        isComplete ? 'bg-green-500/20' : 'bg-brand-lime/20'
                                    }`}>
                                        {isComplete ? (
                                            <CheckCircle2 size={16} className="text-green-500" />
                                        ) : (
                                            <span className="text-brand-lime font-bold text-xs">{exIndex + 1}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-medium text-white text-sm truncate">{exDef?.name || 'Ejercicio'}</h3>
                                        <p className="text-[11px] text-gray-400">
                                            {progress.completed}/{progress.total} series • {exercise.targetReps} reps
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${isComplete ? 'bg-green-500' : 'bg-brand-lime'}`}
                                            style={{ width: `${progress.percent}%` }}
                                        />
                                    </div>
                                    {isExpanded ? (
                                        <ChevronUp size={18} className="text-gray-400" />
                                    ) : (
                                        <ChevronDown size={18} className="text-gray-400" />
                                    )}
                                </div>
                            </button>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="px-3 pb-3 space-y-2 border-t border-white/5 pt-2">
                                    {/* Notes if any */}
                                    {exercise.exerciseNotes && (
                                        <p className="text-xs text-brand-lime bg-brand-lime/10 px-3 py-2 rounded-lg">
                                            💡 {exercise.exerciseNotes}
                                        </p>
                                    )}

                                    {/* Sets */}
                                    <div className="space-y-2">
                                        {/* Header */}
                                        <div className="grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 text-xs text-gray-500 px-1">
                                            <span>#</span>
                                            <span>Kg</span>
                                            <span>Reps</span>
                                            <span>RIR</span>
                                            <span></span>
                                        </div>

                                        {/* Set Rows */}
                                        {exercise.sets.map((set, setIndex) => (
                                            <div 
                                                key={setIndex}
                                                className={`grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 items-center p-2 rounded-xl ${
                                                    set.completed ? 'bg-green-500/10' : 'bg-white/5'
                                                }`}
                                            >
                                                <span className="text-sm font-bold text-gray-400 text-center">{set.setNumber}</span>
                                                
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    value={set.weight === 0 ? '' : set.weight}
                                                    onChange={(e) => updateSessionSet(exIndex, setIndex, { 
                                                        weight: e.target.value === '' ? 0 : parseFloat(e.target.value) 
                                                    })}
                                                    placeholder="0"
                                                    className="h-9 w-full text-center text-sm bg-white/10 border border-white/10 rounded-lg text-white focus:border-brand-lime focus:outline-none"
                                                />
                                                
                                                <input
                                                    type="number"
                                                    value={set.reps === 0 ? '' : set.reps}
                                                    onChange={(e) => updateSessionSet(exIndex, setIndex, { 
                                                        reps: e.target.value === '' ? 0 : parseInt(e.target.value) 
                                                    })}
                                                    placeholder="0"
                                                    className="h-9 w-full text-center text-sm bg-white/10 border border-white/10 rounded-lg text-white focus:border-brand-lime focus:outline-none"
                                                />
                                                
                                                <select
                                                    value={set.rir}
                                                    onChange={(e) => updateSessionSet(exIndex, setIndex, { rir: parseInt(e.target.value) })}
                                                    className="h-9 w-full text-center text-sm bg-white/10 border border-white/10 rounded-lg text-white focus:border-brand-lime focus:outline-none appearance-none cursor-pointer"
                                                >
                                                    <option value={-1}>Fallo</option>
                                                    <option value={0}>@0</option>
                                                    <option value={1}>@1</option>
                                                    <option value={2}>@2</option>
                                                    <option value={3}>@3</option>
                                                    <option value={4}>@4+</option>
                                                </select>
                                                
                                                <button
                                                    onClick={() => updateSessionSet(exIndex, setIndex, { completed: !set.completed })}
                                                    className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
                                                        set.completed 
                                                            ? 'bg-green-500 text-white' 
                                                            : 'bg-white/10 text-gray-400 hover:bg-brand-lime hover:text-brand-dark'
                                                    }`}
                                                >
                                                    <Check size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => addSetToExercise(exIndex)}
                                            className="flex-1 py-2 border border-dashed border-white/20 rounded-xl text-xs text-gray-400 hover:border-brand-lime hover:text-brand-lime transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Plus size={14} />
                                            Serie
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setShowReplaceModal(exIndex);
                                            }}
                                            className="flex-1 py-2 border border-dashed border-white/20 rounded-xl text-xs text-gray-400 hover:border-orange-400 hover:text-orange-400 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <RefreshCw size={14} />
                                            Cambiar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Add Exercise Button */}
                <button
                    onClick={() => {
                        setSearchTerm('');
                        setShowAddModal(true);
                    }}
                    className="w-full p-3 border border-dashed border-white/10 rounded-xl text-gray-400 hover:border-brand-lime hover:text-brand-lime transition-colors flex items-center justify-center gap-2 text-sm"
                >
                    <Plus size={16} />
                    Agregar Ejercicio
                </button>
            </div>

            {/* Finish Button - Fixed at bottom */}
            <div className="fixed bottom-28 left-4 right-4 z-40">
                <Button
                    onClick={() => setShowFinishConfirm(true)}
                    className="w-full h-12 bg-brand-lime text-brand-dark hover:bg-brand-lime/90 rounded-xl text-sm font-bold shadow-lg"
                >
                    Finalizar Entrenamiento
                </Button>
            </div>

            {/* Replace Exercise Modal */}
            <Modal
                isOpen={showReplaceModal !== null}
                onClose={() => setShowReplaceModal(null)}
                title="Cambiar Ejercicio"
            >
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Buscar ejercicio..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {filteredExercises.map(ex => (
                            <button
                                key={ex.id}
                                onClick={() => {
                                    replaceExerciseInSession(showReplaceModal, ex.id);
                                    setShowReplaceModal(null);
                                }}
                                className="w-full p-3 bg-brand-gray/30 hover:bg-brand-gray/50 rounded-xl text-left transition-colors"
                            >
                                <span className="font-medium text-white">{ex.name}</span>
                                <span className="text-xs text-gray-400 ml-2">{ex.muscleGroup}</span>
                            </button>
                        ))}
                        {filteredExercises.length === 0 && (
                            <p className="text-center text-gray-500 py-4">No se encontraron ejercicios</p>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Add Exercise Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Agregar Ejercicio"
            >
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Buscar ejercicio..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {filteredExercises.map(ex => (
                            <button
                                key={ex.id}
                                onClick={async () => {
                                    await addExerciseToSession(ex.id, false);
                                    setShowAddModal(false);
                                    // Expand the new exercise
                                    setExpandedExercise(activeSession.exercises.length);
                                }}
                                className="w-full p-3 bg-brand-gray/30 hover:bg-brand-gray/50 rounded-xl text-left transition-colors"
                            >
                                <span className="font-medium text-white">{ex.name}</span>
                                <span className="text-xs text-gray-400 ml-2">{ex.muscleGroup}</span>
                            </button>
                        ))}
                        {filteredExercises.length === 0 && (
                            <p className="text-center text-gray-500 py-4">No se encontraron ejercicios</p>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Finish/Cancel Confirm Modal */}
            <Modal
                isOpen={showFinishConfirm}
                onClose={() => setShowFinishConfirm(false)}
                title="Opciones de entrenamiento"
            >
                <div className="space-y-4">
                    <p className="text-gray-400 text-sm">¿Qué querés hacer?</p>
                    <div className="space-y-2">
                        <Button
                            onClick={handleFinish}
                            className="w-full bg-brand-lime text-brand-dark h-12"
                        >
                            ✓ Guardar y Finalizar
                        </Button>
                        <Button
                            onClick={() => {
                                setShowFinishConfirm(false);
                                navigate('/');
                            }}
                            variant="secondary"
                            className="w-full h-12"
                        >
                            ⏸ Pausar (volver al inicio)
                        </Button>
                        <Button
                            onClick={handleCancel}
                            variant="secondary"
                            className="w-full text-red-400 border-red-400/30 hover:bg-red-400/10 h-12"
                        >
                            ✕ Descartar y Empezar de Nuevo
                        </Button>
                        <Button
                            onClick={() => setShowFinishConfirm(false)}
                            variant="ghost"
                            className="w-full"
                        >
                            Continuar Entrenando
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
