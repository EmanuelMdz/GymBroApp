import React, { useState } from 'react';
import { useWorkout } from '../../contexts/WorkoutContext';
import { useExercises } from '../../contexts/ExerciseContext';
import { Trash2, GripVertical, Plus } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { ExerciseList } from '../exercises/ExerciseList';
import { Input } from '../common/Input';

export function DayConfig({ day, onClose }) {
    const { updateDayRoutine, addExerciseToDay, removeExerciseFromDay, updateDayExercise } = useWorkout();
    const { getExerciseById } = useExercises();
    const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);

    const handleNameChange = (e) => {
        updateDayRoutine(day.id, { name: e.target.value });
    };

    const handleAddExercise = (exerciseId) => {
        if (day.exercises.find(ex => ex.exerciseId === exerciseId)) return;
        addExerciseToDay(day.id, exerciseId);
        setIsExerciseSelectorOpen(false);
    };

    return (
        <div className="space-y-6">
            <Input
                label="Nombre del Día"
                value={day.name}
                onChange={handleNameChange}
                placeholder="ej. Push Day"
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

                        return (
                            <div key={`${day.id}-ex-${index}`} className="flex flex-col bg-surface-light/30 rounded-lg p-3 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{exerciseDef.name}</span>
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeExerciseFromDay(day.id, index)}>
                                        <Trash2 className="h-4 w-4 text-danger/70" />
                                    </Button>
                                </div>
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
                                            onChange={(e) => updateDayExercise(day.id, index, { targetReps: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-text-secondary uppercase">Descanso (s)</label>
                                        <Input
                                            type="number"
                                            className="h-8 text-xs"
                                            value={dayExercise.restSeconds}
                                            onChange={(e) => updateDayExercise(day.id, index, { restSeconds: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
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
