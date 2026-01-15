import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '../contexts/WorkoutContext';
import { useExercises } from '../contexts/ExerciseContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
    Calendar, 
    Plus, 
    Trash2, 
    ChevronLeft, 
    Search, 
    Check,
    Dumbbell,
    ChevronDown,
    ChevronUp,
    RefreshCw
} from 'lucide-react';

export default function AddPastWorkout() {
    const navigate = useNavigate();
    const { routine, addPastWorkout } = useWorkout();
    const { exercises } = useExercises();
    
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedDayId, setSelectedDayId] = useState('');
    const [workoutExercises, setWorkoutExercises] = useState([]);
    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [showReplaceModal, setShowReplaceModal] = useState(null); // index of exercise to replace
    const [searchTerm, setSearchTerm] = useState('');
    const [saving, setSaving] = useState(false);
    const [expandedExercise, setExpandedExercise] = useState(null);

    // Filter days that have exercises
    const activeDays = routine.filter(d => d.exercises && d.exercises.length > 0);

    const filteredExercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 20);
    
    // When selecting a day, pre-load its exercises
    const handleDaySelect = (dayId) => {
        setSelectedDayId(dayId);
        if (dayId) {
            const day = routine.find(d => d.id === dayId);
            if (day && day.exercises) {
                // Pre-populate with the day's exercises
                const preloadedExercises = day.exercises.map(ex => {
                    const exDef = exercises.find(e => e.id === ex.exerciseId);
                    return {
                        exerciseId: ex.exerciseId,
                        exerciseName: exDef?.name || 'Ejercicio',
                        sets: Array(ex.targetSets || 3).fill(null).map(() => ({ weight: 0, reps: 0, rir: 2 }))
                    };
                });
                setWorkoutExercises(preloadedExercises);
            }
        }
    };

    const addExercise = (exercise) => {
        setWorkoutExercises([...workoutExercises, {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            sets: [{ weight: 0, reps: 0, rir: 2 }]
        }]);
        setShowExerciseModal(false);
        setSearchTerm('');
        // Expand the new exercise
        setExpandedExercise(workoutExercises.length);
    };

    const replaceExercise = (index, exercise) => {
        const updated = [...workoutExercises];
        updated[index] = {
            ...updated[index],
            exerciseId: exercise.id,
            exerciseName: exercise.name
        };
        setWorkoutExercises(updated);
        setShowReplaceModal(null);
        setSearchTerm('');
    };

    const removeExercise = (index) => {
        setWorkoutExercises(workoutExercises.filter((_, i) => i !== index));
        if (expandedExercise === index) setExpandedExercise(null);
    };

    const toggleExercise = (index) => {
        setExpandedExercise(expandedExercise === index ? null : index);
    };

    const addSet = (exIndex) => {
        const updated = [...workoutExercises];
        updated[exIndex].sets.push({ weight: 0, reps: 0, rir: 2 });
        setWorkoutExercises(updated);
    };

    const removeSet = (exIndex, setIndex) => {
        const updated = [...workoutExercises];
        updated[exIndex].sets = updated[exIndex].sets.filter((_, i) => i !== setIndex);
        setWorkoutExercises(updated);
    };

    const updateSet = (exIndex, setIndex, field, value) => {
        const updated = [...workoutExercises];
        updated[exIndex].sets[setIndex][field] = value;
        setWorkoutExercises(updated);
    };

    const handleSave = async () => {
        if (!selectedDate || workoutExercises.length === 0) return;
        
        setSaving(true);
        const date = new Date(selectedDate + 'T12:00:00');
        const success = await addPastWorkout(date, selectedDayId || null, workoutExercises);
        setSaving(false);
        
        if (success) {
            navigate('/stats');
        }
    };

    const totalVolume = workoutExercises.reduce((acc, ex) => 
        acc + ex.sets.reduce((sAcc, s) => sAcc + ((s.weight || 0) * (s.reps || 0)), 0), 0);

    return (
        <div className="pb-24 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Cargar Entrenamiento</h1>
            </div>

            {/* Date Selector */}
            <Card className="bg-brand-card border-white/5 p-4">
                <label className="text-xs text-gray-400 uppercase block mb-2">Fecha del entrenamiento</label>
                <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-brand-lime" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        max={format(new Date(), 'yyyy-MM-dd')}
                        className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-lime focus:outline-none"
                    />
                </div>
            </Card>

            {/* Day Selector (Optional) */}
            <Card className="bg-brand-card border-white/5 p-4">
                <label className="text-xs text-gray-400 uppercase block mb-2">Tipo de rutina (opcional)</label>
                <select
                    value={selectedDayId}
                    onChange={(e) => handleDaySelect(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-lime focus:outline-none"
                >
                    <option value="" className="bg-brand-dark">Sin especificar</option>
                    {routine.filter(d => d.exercises && d.exercises.length > 0).map(day => (
                        <option key={day.id} value={day.id} className="bg-brand-dark">{day.name}</option>
                    ))}
                </select>
            </Card>

            {/* Exercises */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h2 className="text-sm font-bold text-white uppercase">Ejercicios</h2>
                    {workoutExercises.length > 0 && (
                        <span className="text-xs text-brand-lime font-medium">Vol: {totalVolume.toLocaleString()} kg</span>
                    )}
                </div>

                {workoutExercises.map((ex, exIndex) => {
                    const isExpanded = expandedExercise === exIndex;
                    const exVolume = ex.sets.reduce((acc, s) => acc + ((s.weight || 0) * (s.reps || 0)), 0);
                    
                    return (
                        <div 
                            key={exIndex}
                            className={`bg-brand-card rounded-xl border transition-all ${
                                isExpanded ? 'border-brand-lime/50' : 'border-white/5'
                            }`}
                        >
                            {/* Exercise Header - Clickable */}
                            <button
                                onClick={() => toggleExercise(exIndex)}
                                className="w-full p-3 flex items-center justify-between text-left"
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-brand-lime/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-brand-lime font-bold text-xs">{exIndex + 1}</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-medium text-white text-sm truncate">{ex.exerciseName}</h3>
                                        <p className="text-[11px] text-gray-400">
                                            {ex.sets.length} series • {exVolume > 0 ? `${exVolume} kg` : 'Sin datos'}
                                        </p>
                                    </div>
                                </div>
                                {isExpanded ? (
                                    <ChevronUp size={18} className="text-gray-400" />
                                ) : (
                                    <ChevronDown size={18} className="text-gray-400" />
                                )}
                            </button>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="px-3 pb-3 space-y-2 border-t border-white/5 pt-2">
                                    {/* Sets Header */}
                                    <div className="grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 text-xs text-gray-500 px-1">
                                        <span>#</span>
                                        <span>Kg</span>
                                        <span>Reps</span>
                                        <span>RIR</span>
                                        <span></span>
                                    </div>

                                    {/* Sets */}
                                    {ex.sets.map((set, setIndex) => (
                                        <div 
                                            key={setIndex}
                                            className="grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 items-center p-2 rounded-xl bg-white/5"
                                        >
                                            <span className="text-sm font-bold text-gray-400 text-center">{setIndex + 1}</span>
                                            
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={set.weight === 0 ? '' : set.weight}
                                                onChange={(e) => updateSet(exIndex, setIndex, 'weight', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                                                placeholder="0"
                                                className="h-9 w-full text-center text-sm bg-white/10 border border-white/10 rounded-lg text-white focus:border-brand-lime focus:outline-none"
                                            />
                                            
                                            <input
                                                type="number"
                                                value={set.reps === 0 ? '' : set.reps}
                                                onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value === '' ? 0 : parseInt(e.target.value))}
                                                placeholder="0"
                                                className="h-9 w-full text-center text-sm bg-white/10 border border-white/10 rounded-lg text-white focus:border-brand-lime focus:outline-none"
                                            />
                                            
                                            <select
                                                value={set.rir}
                                                onChange={(e) => updateSet(exIndex, setIndex, 'rir', parseInt(e.target.value))}
                                                className="h-9 w-full text-center text-sm bg-white/10 border border-white/10 rounded-lg text-white focus:border-brand-lime focus:outline-none appearance-none cursor-pointer"
                                            >
                                                <option value={-1} className="bg-brand-dark">Fallo</option>
                                                <option value={0} className="bg-brand-dark">@0</option>
                                                <option value={1} className="bg-brand-dark">@1</option>
                                                <option value={2} className="bg-brand-dark">@2</option>
                                                <option value={3} className="bg-brand-dark">@3</option>
                                                <option value={4} className="bg-brand-dark">@4+</option>
                                            </select>
                                            
                                            <button
                                                onClick={() => removeSet(exIndex, setIndex)}
                                                disabled={ex.sets.length <= 1}
                                                className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
                                                    ex.sets.length <= 1 
                                                        ? 'text-gray-600 cursor-not-allowed' 
                                                        : 'text-gray-400 hover:bg-red-500/20 hover:text-red-400'
                                                }`}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => addSet(exIndex)}
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
                                        <button
                                            onClick={() => removeExercise(exIndex)}
                                            className="py-2 px-3 border border-dashed border-red-500/30 rounded-xl text-xs text-red-400 hover:border-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center"
                                        >
                                            <Trash2 size={14} />
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
                        setShowExerciseModal(true);
                    }}
                    className="w-full p-3 border border-dashed border-white/10 rounded-xl text-gray-400 hover:border-brand-lime hover:text-brand-lime transition-colors flex items-center justify-center gap-2 text-sm"
                >
                    <Plus size={16} />
                    Agregar Ejercicio
                </button>
            </div>

            {/* Save Button */}
            {workoutExercises.length > 0 && (
                <div className="fixed bottom-24 left-4 right-4 z-40">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full h-12 bg-brand-lime text-brand-dark hover:bg-brand-lime/90 rounded-xl font-bold"
                    >
                        {saving ? 'Guardando...' : `Guardar Entrenamiento (${totalVolume.toLocaleString()} kg)`}
                    </Button>
                </div>
            )}

            {/* Exercise Selector Modal */}
            <Modal
                isOpen={showExerciseModal}
                onClose={() => setShowExerciseModal(false)}
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
                                onClick={() => addExercise(ex)}
                                className="w-full p-3 bg-brand-gray/30 hover:bg-brand-gray/50 rounded-xl text-left transition-colors flex items-center gap-3"
                            >
                                <Dumbbell size={16} className="text-brand-lime" />
                                <div>
                                    <span className="font-medium text-white text-sm">{ex.name}</span>
                                    <span className="text-xs text-gray-400 ml-2">{ex.muscleGroup}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </Modal>

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
                                onClick={() => replaceExercise(showReplaceModal, ex)}
                                className="w-full p-3 bg-brand-gray/30 hover:bg-brand-gray/50 rounded-xl text-left transition-colors flex items-center gap-3"
                            >
                                <Dumbbell size={16} className="text-orange-400" />
                                <div>
                                    <span className="font-medium text-white text-sm">{ex.name}</span>
                                    <span className="text-xs text-gray-400 ml-2">{ex.muscleGroup}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
