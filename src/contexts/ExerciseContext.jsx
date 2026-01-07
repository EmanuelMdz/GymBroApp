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
        const { data, error } = await supabase
            .from('exercises')
            .select('*')
            .order('name');

        if (error) console.error('Error fetching exercises:', error);
        else setExercises(data || []);
        setLoading(false);
    };

    const addExercise = async (exercise) => {
        // Optimistic update could be done here, but standard fetch is safer for consistent ID
        const { data, error } = await supabase
            .from('exercises')
            .insert([{ ...exercise, user_id: user.id }])
            .select()
            .single();

        if (error) {
            console.error('Error adding exercise:', error);
        } else {
            setExercises(prev => [...prev, data]);
        }
        return { data, error };
    };

    const updateExercise = async (id, updatedData) => {
        // Optimistic update
        setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, ...updatedData } : ex));

        const { error } = await supabase
            .from('exercises')
            .update(updatedData)
            .eq('id', id);

        if (error) {
            console.error('Error updating exercise:', error);
            // Revert on error would be ideal
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
