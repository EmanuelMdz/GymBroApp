import React, { useState, useEffect } from 'react';
import { useExercises } from '../../contexts/ExerciseContext';
import { MUSCLE_GROUPS } from '../../data/models';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { cn } from '../../utils/cn';

export function ExerciseForm({ exerciseToEdit, onClose }) {
    const { addExercise, updateExercise } = useExercises();
    const [formData, setFormData] = useState({
        name: '',
        muscleGroup: 'chest',
        equipment: 'barbell',
        notes: ''
    });

    useEffect(() => {
        if (exerciseToEdit) {
            setFormData(exerciseToEdit);
        }
    }, [exerciseToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (exerciseToEdit) {
            updateExercise(exerciseToEdit.id, formData);
        } else {
            addExercise(formData);
        }
        onClose();
    };

    const muscleGroups = Object.entries(MUSCLE_GROUPS).map(([key, value]) => ({
        value: key,
        label: value.label
    }));

    const equipmentOptions = [
        { value: 'barbell', label: 'Barra' },
        { value: 'dumbbell', label: 'Mancuerna' },
        { value: 'machine', label: 'Máquina' },
        { value: 'cable', label: 'Polea' },
        { value: 'bodyweight', label: 'Corporal' },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Nombre del Ejercicio"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="ej. Press de Banca"
            />

            <div className="w-full">
                <label className="mb-2 block text-sm font-medium text-text-secondary">Grupo Muscular</label>
                <div className="grid grid-cols-3 gap-2">
                    {muscleGroups.map((mg) => (
                        <button
                            key={mg.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, muscleGroup: mg.value })}
                            className={cn(
                                "p-2 text-xs rounded-md border text-center transition-colors",
                                formData.muscleGroup === mg.value
                                    ? "bg-primary border-primary text-white"
                                    : "bg-surface border-surface-light text-text-secondary hover:bg-surface-light"
                            )}
                        >
                            {mg.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full">
                <label className="mb-2 block text-sm font-medium text-text-secondary">Equipamiento</label>
                <select
                    className="flex h-10 w-full rounded-md border border-surface-light bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.equipment}
                    onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                >
                    {equipmentOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            <Input
                label="Notas Personales"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Tips, ajustes de máquina, etc."
            />

            <div className="pt-2 flex justify-end space-x-2">
                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button type="submit">{exerciseToEdit ? 'Guardar Cambios' : 'Crear Ejercicio'}</Button>
            </div>
        </form>
    );
}
