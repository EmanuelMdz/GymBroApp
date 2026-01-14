import React from 'react';
import { Pencil, Trash2, Globe, User } from 'lucide-react';
import { Button } from '../common/Button';

export function ExerciseCard({ exercise, onEdit, onDelete }) {
    // Get first 2 letters of muscle group for avatar
    const initials = (exercise.muscleGroup || 'EJ').substring(0, 2).toUpperCase();
    
    return (
        <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-surface-light hover:border-primary/50 transition-colors">
            <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase bg-brand-purple">
                    {initials}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-text-primary">{exercise.name}</h3>
                        {exercise.isGlobal ? (
                            <Globe className="h-3 w-3 text-gray-500" title="Ejercicio base" />
                        ) : (
                            <User className="h-3 w-3 text-brand-lime" title="Ejercicio personalizado" />
                        )}
                    </div>
                    <p className="text-xs text-text-secondary">
                        {exercise.muscleGroup} • {exercise.equipment}
                        {exercise.subcategory && ` • ${exercise.subcategory}`}
                    </p>
                </div>
            </div>
            {/* Only show edit/delete for user's custom exercises */}
            {!exercise.isGlobal && (onEdit || onDelete) && (
                <div className="flex space-x-1">
                    {onEdit && (
                        <Button variant="ghost" size="icon" onClick={() => onEdit(exercise)}>
                            <Pencil className="h-4 w-4 text-text-secondary" />
                        </Button>
                    )}
                    {onDelete && (
                        <Button variant="ghost" size="icon" onClick={() => onDelete(exercise.id)}>
                            <Trash2 className="h-4 w-4 text-danger/70 hover:text-danger" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
