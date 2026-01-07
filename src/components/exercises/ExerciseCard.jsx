import React from 'react';
import { MUSCLE_GROUPS } from '../../data/models';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';

export function ExerciseCard({ exercise, onEdit, onDelete }) {
    const muscleInfo = MUSCLE_GROUPS[exercise.muscleGroup] || MUSCLE_GROUPS.chest;

    return (
        <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-surface-light hover:border-primary/50 transition-colors">
            <div className="flex items-center space-x-4">
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase"
                    style={{ backgroundColor: muscleInfo.color }}
                >
                    {muscleInfo.label.substring(0, 2)}
                </div>
                <div>
                    <h3 className="font-semibold text-text-primary">{exercise.name}</h3>
                    <p className="text-xs text-text-secondary capitalize">{muscleInfo.label} • {exercise.equipment}</p>
                </div>
            </div>
            <div className="flex space-x-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(exercise)}>
                    <Pencil className="h-4 w-4 text-text-secondary" />
                </Button>
                {onDelete && (
                    <Button variant="ghost" size="icon" onClick={() => onDelete(exercise.id)}>
                        <Trash2 className="h-4 w-4 text-danger/70 hover:text-danger" />
                    </Button>
                )}
            </div>
        </div>
    );
}
