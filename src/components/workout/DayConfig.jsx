import React, { useState } from 'react';
import { useWorkout } from '../../contexts/WorkoutContext';
import { useExercises } from '../../contexts/ExerciseContext';
import { Trash2, Plus, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { ExerciseList } from '../exercises/ExerciseList';
import { Input } from '../common/Input';

const SET_TYPES = [
    { value: 'normal', label: 'Normal', color: 'bg-gray-500' },
    { value: 'strength', label: 'Fuerza', color: 'bg-red-500' },
    { value: 'hypertrophy', label: 'Hipertrofia', color: 'bg-blue-500' },
    { value: 'dropset', label: 'Drop Set', color: 'bg-purple-500' },
    { value: 'amrap', label: 'AMRAP', color: 'bg-orange-500' },
];

export function DayConfig({ day, onClose }) {
    const { updateDayRoutine, addExerciseToDay, removeExerciseFromDay, updateDayExercise } = useWorkout();
    const { getExerciseById } = useExercises();
    const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
    const [expandedExercise, setExpandedExercise] = useState(null);

    const handleNameChange = (e) => {
        updateDayRoutine(day.id, { name: e.target.value });
    };

    const handleAddExercise = (exerciseId) => {
        if (day.exercises.find(ex => ex.exerciseId === exerciseId)) return;
        addExerciseToDay(day.id, exerciseId);
        setIsExerciseSelectorOpen(false);
    };

    const getSetTypeInfo = (type) => SET_TYPES.find(t => t.value === type) || SET_TYPES[0];

    return (
        <div className="space-y-6">
            <Input
                label="Nombre del Día"
                value={day.name}
                onChange={handleNameChange}
                placeholder="ej. Upper A (Fuerza) + Bíceps"
            />

            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-text-secondary">Ejercicios ({day.exercises.length})</h3>
                    <Button size="sm" variant="ghost" onClick={() => setIsExerciseSelectorOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" /> Agregar
                    </Button>
                </div>
                <div className="space-y-3">
                    {day.exercises.map((dayExercise, index) => {
                        const exerciseDef = getExerciseById(dayExercise.exerciseId);
                        if (!exerciseDef) return null;
                        const isExpanded = expandedExercise === index;
                        const setTypeInfo = getSetTypeInfo(dayExercise.setType);

                        return (
                            <div key={`${day.id}-ex-${index}`} className="flex flex-col bg-surface-light/30 rounded-lg p-3 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${setTypeInfo.color}`} />
                                        <span className="font-medium">{exerciseDef.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-6 w-6" 
                                            onClick={() => setExpandedExercise(isExpanded ? null : index)}
                                        >
                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeExerciseFromDay(day.id, index)}>
                                            <Trash2 className="h-4 w-4 text-danger/70" />
                                        </Button>
                                    </div>
                                </div>
                                
                                {/* Quick config row */}
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="text-[10px] text-text-secondary uppercase">Series</label>
                                        <Input
                                            type="number"
                                            className="h-8 text-xs"
                                            value={dayExercise.targetSets}
                                            onChange={(e) => updateDayExercise(day.id, index, { targetSets: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-text-secondary uppercase">Reps</label>
                                        <Input
                                            className="h-8 text-xs"
                                            value={dayExercise.targetReps}
                                            placeholder="8-12"
                                            onChange={(e) => updateDayExercise(day.id, index, { targetReps: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-text-secondary uppercase">Descanso</label>
                                        <Input
                                            type="number"
                                            className="h-8 text-xs"
                                            value={dayExercise.restSeconds}
                                            placeholder="90"
                                            onChange={(e) => updateDayExercise(day.id, index, { restSeconds: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                {/* Expanded options */}
                                {isExpanded && (
                                    <div className="space-y-3 pt-2 border-t border-white/10">
                                        <div>
                                            <label className="text-[10px] text-text-secondary uppercase mb-1 block">Tipo de Serie</label>
                                            <div className="flex flex-wrap gap-1">
                                                {SET_TYPES.map(type => (
                                                    <button
                                                        key={type.value}
                                                        onClick={() => updateDayExercise(day.id, index, { setType: type.value })}
                                                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                                            dayExercise.setType === type.value 
                                                                ? `${type.color} text-white` 
                                                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                                        }`}
                                                    >
                                                        {type.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-text-secondary uppercase mb-1 block">
                                                <MessageSquare className="inline h-3 w-3 mr-1" />
                                                Notas (stretch, pesado, backoff, etc.)
                                            </label>
                                            <Input
                                                className="h-8 text-xs"
                                                value={dayExercise.notes || ''}
                                                placeholder="ej: pesado + backoff, stretch en el bajo"
                                                onChange={(e) => updateDayExercise(day.id, index, { notes: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Show notes preview if collapsed but has notes */}
                                {!isExpanded && dayExercise.notes && (
                                    <p className="text-[10px] text-gray-400 italic truncate">
                                        📝 {dayExercise.notes}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                    {day.exercises.length === 0 && (
                        <div className="text-center py-6 text-text-secondary text-sm border border-dashed border-surface-light rounded-lg">
                            Sin ejercicios asignados
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isExerciseSelectorOpen}
                onClose={() => setIsExerciseSelectorOpen(false)}
                title="Agregar Ejercicio"
            >
                <ExerciseList
                    onSelect={handleAddExercise}
                    selectedIds={day.exercises.map(ex => ex.exerciseId)}
                />
            </Modal>
        </div>
    );
}
