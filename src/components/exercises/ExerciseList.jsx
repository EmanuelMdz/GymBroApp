import React, { useState } from 'react';
import { useExercises } from '../../contexts/ExerciseContext';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseForm } from './ExerciseForm';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Plus, Search } from 'lucide-react';
import { MUSCLE_GROUPS } from '../../data/models';
import { cn } from '../../utils/cn';

export function ExerciseList({ onSelect, selectedIds = [] }) {
    const { exercises, deleteExercise } = useExercises();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMuscle, setFilterMuscle] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExercise, setEditingExercise] = useState(null);

    const filteredExercises = exercises.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMuscle = filterMuscle === 'all' || ex.muscleGroup === filterMuscle;
        return matchesSearch && matchesMuscle;
    });

    const handleEdit = (exercise) => {
        setEditingExercise(exercise);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar este ejercicio?')) {
            deleteExercise(id);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingExercise(null);
    };

    return (
        <div className="space-y-4 pb-20">
            <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-text-secondary" />
                    <Input
                        placeholder="Buscar ejercicio..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {!onSelect && (
                    <Button size="icon" onClick={() => setIsModalOpen(true)}>
                        <Plus className="h-5 w-5" />
                    </Button>
                )}
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => setFilterMuscle('all')}
                    className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                        filterMuscle === 'all'
                            ? "bg-text-primary text-background border-text-primary"
                            : "bg-surface text-text-secondary border-surface-light hover:border-text-secondary"
                    )}
                >
                    Todos
                </button>
                {Object.entries(MUSCLE_GROUPS).map(([key, val]) => (
                    <button
                        key={key}
                        onClick={() => setFilterMuscle(key)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                            filterMuscle === key
                                ? "text-white border-transparent"
                                : "bg-surface text-text-secondary border-surface-light hover:border-text-secondary"
                        )}
                        style={filterMuscle === key ? { backgroundColor: val.color } : {}}
                    >
                        {val.label}
                    </button>
                ))}
            </div>

            <div className="space-y-2">
                {filteredExercises.length === 0 ? (
                    <div className="text-center py-10 text-text-secondary">
                        <p>No se encontraron ejercicios</p>
                        {!onSelect && <Button variant="link" onClick={() => setIsModalOpen(true)}>Crear nuevo</Button>}
                    </div>
                ) : (
                    filteredExercises.map(ex => {
                        const isSelected = selectedIds.includes(ex.id);
                        return (
                            <div key={ex.id} className="relative">
                                <ExerciseCard
                                    exercise={ex}
                                    onEdit={!onSelect ? handleEdit : undefined}
                                    onDelete={!onSelect ? handleDelete : undefined}
                                />
                                {onSelect && (
                                    <button
                                        onClick={() => onSelect(ex.id)}
                                        className={cn(
                                            "absolute inset-0 w-full h-full rounded-xl flex items-center justify-center bg-black/40 transition-opacity",
                                            isSelected ? "opacity-100 bg-primary/20 ring-2 ring-primary" : "opacity-0 hover:opacity-100"
                                        )}
                                    >
                                        {isSelected ? (
                                            <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">Seleccionado</span>
                                        ) : (
                                            <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold">Seleccionar</span>
                                        )}
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingExercise ? "Editar Ejercicio" : "Nuevo Ejercicio"}
            >
                <ExerciseForm
                    exerciseToEdit={editingExercise}
                    onClose={handleCloseModal}
                />
            </Modal>
        </div>
    );
}
