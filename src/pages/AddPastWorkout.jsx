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
    Dumbbell
} from 'lucide-react';

export default function AddPastWorkout() {
    const navigate = useNavigate();
    const { routine, addPastWorkout } = useWorkout();
    const { exercises } = useExercises();
    
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedDayId, setSelectedDayId] = useState('');
    const [workoutExercises, setWorkoutExercises] = useState([]);
    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [saving, setSaving] = useState(false);

    const activeDays = routine.filter(d => d.exercises && d.exercises.length > 0);

    const filteredExercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 20);

    const addExercise = (exercise) => {
        setWorkoutExercises([...workoutExercises, {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            sets: [{ weight: 0, reps: 0, rir: 2 }]
        }]);
        setShowExerciseModal(false);
        setSearchTerm('');
    };

    const removeExercise = (index) => {
        setWorkoutExercises(workoutExercises.filter((_, i) => i !== index));
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
                    onChange={(e) => setSelectedDayId(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-lime focus:outline-none"
                >
                    <option value="">Sin especificar</option>
                    {activeDays.map(day => (
                        <option key={day.id} value={day.id}>{day.name}</option>
                    ))}
                </select>
            </Card>

            {/* Exercises */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h2 className="text-sm font-bold text-white uppercase">Ejercicios</h2>
                    {workoutExercises.length > 0 && (
                        <span className="text-xs text-gray-400">Vol: {totalVolume.toLocaleString()} kg</span>
                    )}
                </div>

                {workoutExercises.map((ex, exIndex) => (
                    <Card key={exIndex} className="bg-brand-card border-white/5 p-3">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-brand-lime/20 flex items-center justify-center">
                                    <span className="text-brand-lime font-bold text-sm">{exIndex + 1}</span>
                                </div>
                                <span className="font-medium text-white text-sm">{ex.exerciseName}</span>
                            </div>
                            <button 
                                onClick={() => removeExercise(exIndex)}
                                className="text-red-400 hover:text-red-300 p-1"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {/* Sets Header */}
                        <div className="grid grid-cols-[30px_1fr_1fr_1fr_30px] gap-2 text-[10px] text-gray-500 uppercase mb-1 px-1">
                            <span>#</span>
                            <span>Kg</span>
                            <span>Reps</span>
                            <span>RIR</span>
                            <span></span>
                        </div>

                        {/* Sets */}
                        {ex.sets.map((set, setIndex) => (
                            <div key={setIndex} className="grid grid-cols-[30px_1fr_1fr_1fr_30px] gap-2 items-center mb-2">
                                <span className="text-xs text-gray-500 text-center">{setIndex + 1}</span>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={set.weight || ''}
                                    onChange={(e) => updateSet(exIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    className="h-9 text-center text-sm bg-white/10 border border-white/10 rounded-lg text-white focus:border-brand-lime focus:outline-none"
                                />
                                <input
                                    type="number"
                                    value={set.reps || ''}
                                    onChange={(e) => updateSet(exIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    className="h-9 text-center text-sm bg-white/10 border border-white/10 rounded-lg text-white focus:border-brand-lime focus:outline-none"
                                />
                                <select
                                    value={set.rir}
                                    onChange={(e) => updateSet(exIndex, setIndex, 'rir', parseInt(e.target.value))}
                                    className="h-9 text-center text-sm bg-white/10 border border-white/10 rounded-lg text-white focus:border-brand-lime focus:outline-none appearance-none"
                                >
                                    <option value={-1}>F</option>
                                    <option value={0}>0</option>
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                    <option value={4}>4+</option>
                                </select>
                                <button
                                    onClick={() => removeSet(exIndex, setIndex)}
                                    className="h-9 w-9 flex items-center justify-center text-gray-500 hover:text-red-400"
                                    disabled={ex.sets.length <= 1}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={() => addSet(exIndex)}
                            className="w-full py-2 border border-dashed border-white/20 rounded-lg text-xs text-gray-400 hover:border-brand-lime hover:text-brand-lime transition-colors flex items-center justify-center gap-1"
                        >
                            <Plus size={12} />
                            Serie
                        </button>
                    </Card>
                ))}

                {/* Add Exercise Button */}
                <button
                    onClick={() => setShowExerciseModal(true)}
                    className="w-full p-4 border-2 border-dashed border-white/10 rounded-xl text-gray-400 hover:border-brand-lime hover:text-brand-lime transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
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
        </div>
    );
}
