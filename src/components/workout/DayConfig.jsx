import React, { useMemo, useState } from 'react';
import { useWorkout } from '../../contexts/WorkoutContext';
import { useExercises } from '../../contexts/ExerciseContext';
import { Trash2, Plus, ChevronDown, ChevronUp, MessageSquare, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';

const SET_TYPES = [
    { value: 'normal', label: 'Normal', color: 'bg-gray-500' },
    { value: 'strength', label: 'Fuerza', color: 'bg-red-500' },
    { value: 'hypertrophy', label: 'Hipertrofia', color: 'bg-blue-500' },
    { value: 'dropset', label: 'Drop Set', color: 'bg-purple-500' },
    { value: 'amrap', label: 'AMRAP', color: 'bg-orange-500' },
];

export function DayConfig({ day, onClose }) {
    const { updateDayRoutine, addExerciseToDay, removeExerciseFromDay, updateDayExercise, reorderExerciseInDay } = useWorkout();
    const { exercises, getExerciseById } = useExercises();
    const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
    const [expandedExercise, setExpandedExercise] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const parseRepRange = (value) => {
        if (!value || typeof value !== 'string') return { min: 8, max: 12 };
        const match = value.match(/(\d{1,2})\s*-\s*(\d{1,2})/);
        if (!match) return { min: 8, max: 12 };
        const min = Math.max(1, Math.min(30, parseInt(match[1], 10)));
        const max = Math.max(1, Math.min(30, parseInt(match[2], 10)));
        return { min: Math.min(min, max), max: Math.max(min, max) };
    };

    const classifySetTypeFromRange = (min, max) => {
        if (min >= 8) return 'hypertrophy';
        if (max <= 7) return 'strength';
        return 'normal';
    };

    const handleNameChange = (e) => {
        updateDayRoutine(day.id, { name: e.target.value });
    };

    const handleAddExercise = (exerciseId) => {
        if (day.exercises.find(ex => ex.exerciseId === exerciseId)) return;
        addExerciseToDay(day.id, exerciseId);
        setIsExerciseSelectorOpen(false);
        setSearchTerm('');
    };

    const moveExercise = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= day.exercises.length) return;
        reorderExerciseInDay(day.id, index, newIndex);
    };

    const getSetTypeInfo = (type) => SET_TYPES.find(t => t.value === type) || SET_TYPES[0];

    // Filter exercises for selector
    const filteredExercises = exercises.filter(ex => 
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !day.exercises.some(de => de.exerciseId === ex.id)
    ).slice(0, 20);

    return (
        <div className="space-y-6">
            <Input
                label="Nombre del Día"
                value={day.name}
                onChange={handleNameChange}
                placeholder="ej. Upper A (Fuerza) + Bíceps"
            />

            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-text-secondary">Ejercicios ({day.exercises.length})</h3>
                    <Button 
                        size="sm" 
                        className="bg-brand-lime text-brand-dark hover:bg-brand-lime/90"
                        onClick={() => setIsExerciseSelectorOpen(true)}
                    >
                        <Plus className="h-4 w-4 mr-1" /> Agregar
                    </Button>
                </div>
                
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {day.exercises.map((dayExercise, index) => {
                        const exerciseDef = getExerciseById(dayExercise.exerciseId);
                        if (!exerciseDef) return null;
                        const isExpanded = expandedExercise === index;
                        const setTypeInfo = getSetTypeInfo(dayExercise.setType);

                        return (
                            <div key={`${day.id}-ex-${index}`} className={`bg-brand-gray/30 rounded-xl overflow-hidden transition-all ${isExpanded ? 'ring-1 ring-brand-lime/50' : ''}`}>
                                {/* Header - always visible */}
                                <div 
                                    className="flex items-center gap-2 p-3 cursor-pointer"
                                    onClick={() => setExpandedExercise(isExpanded ? null : index)}
                                >
                                    {/* Order controls */}
                                    <div className="flex flex-col gap-0.5">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); moveExercise(index, -1); }}
                                            disabled={index === 0}
                                            className={`p-0.5 rounded ${index === 0 ? 'text-gray-600' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                                        >
                                            <ArrowUp size={12} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); moveExercise(index, 1); }}
                                            disabled={index === day.exercises.length - 1}
                                            className={`p-0.5 rounded ${index === day.exercises.length - 1 ? 'text-gray-600' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                                        >
                                            <ArrowDown size={12} />
                                        </button>
                                    </div>

                                    {/* Exercise info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${setTypeInfo.color}`} />
                                            <span className="font-medium text-white">{exerciseDef.name}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {dayExercise.targetSets} series × {dayExercise.targetReps} reps
                                            {dayExercise.notes && <span className="ml-2 text-brand-lime">📝</span>}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); removeExerciseFromDay(day.id, index); }}
                                            className="p-1.5 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Expanded content */}
                                {isExpanded && (
                                    <div className="px-3 pb-3 space-y-3 border-t border-white/5 pt-3">
                                        {/* Quick config row */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-[10px] text-gray-500 uppercase block mb-1">Series</label>
                                                <input
                                                    type="number"
                                                    className="w-full h-10 text-center text-sm bg-white/10 border border-white/10 rounded-lg text-white focus:border-brand-lime focus:outline-none"
                                                    value={dayExercise.targetSets}
                                                    onChange={(e) => updateDayExercise(day.id, index, { targetSets: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-500 uppercase block mb-1">Reps (min-max)</label>
                                                {(() => {
                                                    const range = parseRepRange(dayExercise.targetReps);
                                                    return (
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="30"
                                                                value={range.min}
                                                                onChange={(e) => {
                                                                    const newMin = Math.max(1, Math.min(30, parseInt(e.target.value) || 1));
                                                                    const fixedMax = Math.max(newMin, range.max);
                                                                    const targetReps = `${newMin}-${fixedMax}`;
                                                                    const next = { targetReps };
                                                                    if (!['dropset', 'amrap'].includes(dayExercise.setType)) {
                                                                        next.setType = classifySetTypeFromRange(newMin, fixedMax);
                                                                    }
                                                                    updateDayExercise(day.id, index, next);
                                                                }}
                                                                className="w-12 h-10 text-center text-sm bg-white/10 border border-white/10 rounded-lg text-white focus:border-brand-lime focus:outline-none"
                                                            />
                                                            <span className="text-gray-500">-</span>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="30"
                                                                value={range.max}
                                                                onChange={(e) => {
                                                                    const newMax = Math.max(1, Math.min(30, parseInt(e.target.value) || 1));
                                                                    const fixedMin = Math.min(range.min, newMax);
                                                                    const targetReps = `${fixedMin}-${newMax}`;
                                                                    const next = { targetReps };
                                                                    if (!['dropset', 'amrap'].includes(dayExercise.setType)) {
                                                                        next.setType = classifySetTypeFromRange(fixedMin, newMax);
                                                                    }
                                                                    updateDayExercise(day.id, index, next);
                                                                }}
                                                                className="w-12 h-10 text-center text-sm bg-white/10 border border-white/10 rounded-lg text-white focus:border-brand-lime focus:outline-none"
                                                            />
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-500 uppercase block mb-1">Descanso (s)</label>
                                                <input
                                                    type="number"
                                                    className="w-full h-10 text-center text-sm bg-white/10 border border-white/10 rounded-lg text-white focus:border-brand-lime focus:outline-none"
                                                    value={dayExercise.restSeconds}
                                                    placeholder="90"
                                                    onChange={(e) => updateDayExercise(day.id, index, { restSeconds: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>

                                        {/* Set Type */}
                                        <div>
                                            <label className="text-[10px] text-gray-500 uppercase block mb-2">Tipo de Serie</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {SET_TYPES.map(type => (
                                                    <button
                                                        key={type.value}
                                                        onClick={() => updateDayExercise(day.id, index, { setType: type.value })}
                                                        className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                                                            dayExercise.setType === type.value 
                                                                ? `${type.color} text-white shadow-lg` 
                                                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                                        }`}
                                                    >
                                                        {type.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <label className="text-[10px] text-gray-500 uppercase block mb-1">
                                                <MessageSquare className="inline h-3 w-3 mr-1" />
                                                Notas
                                            </label>
                                            <input
                                                className="w-full h-10 px-3 text-sm bg-white/10 border border-white/10 rounded-lg text-white focus:border-brand-lime focus:outline-none"
                                                value={dayExercise.notes || ''}
                                                placeholder="ej: pesado + backoff, stretch en el bajo"
                                                onChange={(e) => updateDayExercise(day.id, index, { notes: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    {day.exercises.length === 0 && (
                        <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-white/10 rounded-xl">
                            <p className="mb-2">Sin ejercicios</p>
                            <Button 
                                size="sm" 
                                className="bg-brand-lime text-brand-dark"
                                onClick={() => setIsExerciseSelectorOpen(true)}
                            >
                                <Plus className="h-4 w-4 mr-1" /> Agregar primer ejercicio
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Exercise Selector Modal */}
            <Modal
                isOpen={isExerciseSelectorOpen}
                onClose={() => { setIsExerciseSelectorOpen(false); setSearchTerm(''); }}
                title="Agregar Ejercicio"
            >
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <input
                            placeholder="Buscar ejercicio..."
                            className="w-full h-10 pl-9 pr-3 text-sm bg-white/10 border border-white/10 rounded-lg text-white focus:border-brand-lime focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-1">
                        {filteredExercises.map(ex => (
                            <button
                                key={ex.id}
                                onClick={() => handleAddExercise(ex.id)}
                                className="w-full p-3 bg-brand-gray/30 hover:bg-brand-gray/50 rounded-xl text-left transition-colors flex justify-between items-center"
                            >
                                <div>
                                    <span className="font-medium text-white">{ex.name}</span>
                                    <span className="text-xs text-gray-400 ml-2">{ex.muscleGroup}</span>
                                </div>
                                <Plus size={18} className="text-brand-lime" />
                            </button>
                        ))}
                        {filteredExercises.length === 0 && searchTerm && (
                            <p className="text-center text-gray-500 py-4">No se encontraron ejercicios</p>
                        )}
                        {filteredExercises.length === 0 && !searchTerm && (
                            <p className="text-center text-gray-500 py-4">Escribí para buscar ejercicios</p>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
