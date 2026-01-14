import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const ExerciseContext = createContext();

export function useExercises() {
    return useContext(ExerciseContext);
}

export function ExerciseProvider({ children }) {
    const { user } = useAuth();
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchExercises();
        } else {
            setExercises([]);
        }
    }, [user]);

    const fetchExercises = async () => {
        setLoading(true);
        // Fetch global exercises + user's custom exercises
        const { data, error } = await supabase
            .from('exercises')
            .select('*')
            .or(`is_global.eq.true,user_id.eq.${user.id}`)
            .order('muscle_group')
            .order('name');

        if (error) {
            console.error('Error fetching exercises:', error);
        } else {
            // Map snake_case to camelCase for UI
            const mappedData = (data || []).map(ex => ({
                ...ex,
                muscleGroup: ex.muscle_group,
                isGlobal: ex.is_global,
                subcategory: ex.subcategory
            }));
            setExercises(mappedData);
        }
        setLoading(false);
    };

    const addExercise = async (exercise) => {
        // Map camelCase to snake_case for DB - user exercises are never global
        const dbExercise = {
            user_id: user.id,
            name: exercise.name,
            muscle_group: exercise.muscleGroup,
            equipment: exercise.equipment,
            subcategory: exercise.subcategory || null,
            notes: exercise.notes || null,
            is_global: false
        };

        const { data, error } = await supabase
            .from('exercises')
            .insert([dbExercise])
            .select()
            .single();

        if (error) {
            console.error('Error adding exercise:', error);
        } else {
            // Map back to camelCase for UI
            const mappedData = {
                ...data,
                muscleGroup: data.muscle_group,
                isGlobal: data.is_global,
                subcategory: data.subcategory
            };
            setExercises(prev => [...prev, mappedData]);
        }
        return { data, error };
    };

    const updateExercise = async (id, updatedData) => {
        // Optimistic update
        setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, ...updatedData } : ex));

        // Map camelCase to snake_case for DB
        const dbUpdates = {};
        if ('name' in updatedData) dbUpdates.name = updatedData.name;
        if ('muscleGroup' in updatedData) dbUpdates.muscle_group = updatedData.muscleGroup;
        if ('equipment' in updatedData) dbUpdates.equipment = updatedData.equipment;
        if ('notes' in updatedData) dbUpdates.notes = updatedData.notes;

        const { error } = await supabase
            .from('exercises')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error('Error updating exercise:', error);
            fetchExercises();
        }
    };

    const deleteExercise = async (id) => {
        setExercises(prev => prev.filter(ex => ex.id !== id));

        const { error } = await supabase
            .from('exercises')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting exercise:', error);
            fetchExercises();
        }
    };

    const getExerciseById = (id) => {
        return exercises.find(ex => ex.id === id);
    }

    const value = {
        exercises,
        loading,
        addExercise,
        updateExercise,
        deleteExercise,
        getExerciseById
    };

    return (
        <ExerciseContext.Provider value={value}>
            {children}
        </ExerciseContext.Provider>
    );
}
