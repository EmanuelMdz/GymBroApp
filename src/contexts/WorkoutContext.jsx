import { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

const WorkoutContext = createContext();

export function useWorkout() {
    return useContext(WorkoutContext);
}

export function WorkoutProvider({ children }) {
    const { user } = useAuth();

    // Remote State
    const [routine, setRoutine] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Local State for Active Session (Persistence for safety, but final save goes to DB)
    const [activeSession, setActiveSession] = useLocalStorage('gymtracker-active-session', null);

    useEffect(() => {
        if (user) {
            fetchRoutine();
            fetchHistory();
        } else {
            setRoutine([]);
            setHistory([]);
        }
    }, [user]);

    // --- Data Fetching ---

    const fetchRoutine = async () => {
        setLoading(true);
        // Ensure default days exist
        await ensureDefaultDays();

        const { data, error } = await supabase
            .from('workout_days')
            .select(`
                *,
                exercises:workout_day_exercises(*)
            `)
            .order('day_of_week');

        if (error) {
            console.error('Error fetching routine:', error);
        } else {
            // Sort exercises by order
            const formattedRoutine = data.map(day => ({
                ...day,
                exercises: (day.exercises || []).sort((a, b) => a.order - b.order).map(ex => ({
                    ...ex,
                    exerciseId: ex.exercise_id,
                    targetSets: ex.target_sets,
                    targetReps: ex.target_reps,
                    restSeconds: ex.rest_seconds,
                    setType: ex.set_type || 'normal',
                    notes: ex.notes || ''
                }))
            }));
            setRoutine(formattedRoutine);
        }
        setLoading(false);
    };

    const ensureDefaultDays = async () => {
        // Check if days exist, if not create them
        const { count } = await supabase.from('workout_days').select('*', { count: 'exact', head: true });
        if (count === 0) {
            const days = [
                { user_id: user.id, day_of_week: 0, name: 'Domingo' },
                { user_id: user.id, day_of_week: 1, name: 'Lunes' },
                { user_id: user.id, day_of_week: 2, name: 'Martes' },
                { user_id: user.id, day_of_week: 3, name: 'Miércoles' },
                { user_id: user.id, day_of_week: 4, name: 'Jueves' },
                { user_id: user.id, day_of_week: 5, name: 'Viernes' },
                { user_id: user.id, day_of_week: 6, name: 'Sábado' },
            ];
            await supabase.from('workout_days').insert(days);
        }
    };

    const fetchHistory = async () => {
        const { data, error } = await supabase
            .from('workout_sessions')
            .select(`
                *,
                exercises:performed_exercises(
                    *,
                    sets:performed_sets(*)
                )
            `)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching history:', error);
        } else {
            setHistory(data);
        }
    };


    // --- Routine Mutations ---

    const updateDayRoutine = async (dayId, data) => {
        // Optimistic
        setRoutine(prev => prev.map(d => d.id === dayId ? { ...d, ...data } : d));

        await supabase.from('workout_days').update(data).eq('id', dayId);
    };

    const addExerciseToDay = async (dayId, exerciseId) => {
        const day = routine.find(d => d.id === dayId);
        const newOrder = day.exercises.length;

        const newExercise = {
            workout_day_id: dayId,
            exercise_id: exerciseId,
            order: newOrder,
            target_sets: 3,
            target_reps: '8-12',
            rest_seconds: 90
        };

        const { data, error } = await supabase
            .from('workout_day_exercises')
            .insert([newExercise])
            .select()
            .single();

        if (error) {
            console.error(error);
            return;
        }

        const mappedExercise = {
            ...data,
            exerciseId: data.exercise_id,
            targetSets: data.target_sets,
            targetReps: data.target_reps,
            restSeconds: data.rest_seconds
        };

        setRoutine(prev => prev.map(d => {
            if (d.id === dayId) {
                return { ...d, exercises: [...d.exercises, mappedExercise] };
            }
            return d;
        }));
    };

    const updateDayExercise = async (dayId, exerciseIndex, data) => {
        // Data comes in camelCase for UI, need to map to snake_case for DB if keys match
        // But here 'data' might be { targetSets: 4 } etc.
        const day = routine.find(d => d.id === dayId);
        const exercise = day.exercises[exerciseIndex];
        if (!exercise) return;

        // Map keys
        const dbUpdates = {};
        if ('targetSets' in data) dbUpdates.target_sets = data.targetSets;
        if ('targetReps' in data) dbUpdates.target_reps = data.targetReps;
        if ('restSeconds' in data) dbUpdates.rest_seconds = data.restSeconds;
        if ('setType' in data) dbUpdates.set_type = data.setType;
        if ('notes' in data) dbUpdates.notes = data.notes;

        // Optimistic UI
        setRoutine(prev => prev.map(d => {
            if (d.id === dayId) {
                const newExs = [...d.exercises];
                newExs[exerciseIndex] = { ...newExs[exerciseIndex], ...data };
                return { ...d, exercises: newExs };
            }
            return d;
        }));

        if (Object.keys(dbUpdates).length > 0) {
            await supabase.from('workout_day_exercises').update(dbUpdates).eq('id', exercise.id);
        }
    };

    const removeExerciseFromDay = async (dayId, exerciseIndex) => {
        const day = routine.find(d => d.id === dayId);
        const exercise = day.exercises[exerciseIndex];
        if (!exercise) return;

        setRoutine(prev => prev.map(d => {
            if (d.id === dayId) {
                return { ...d, exercises: d.exercises.filter((_, i) => i !== exerciseIndex) };
            }
            return d;
        }));

        await supabase.from('workout_day_exercises').delete().eq('id', exercise.id);
    };


    // --- Session Logic ---

    const startSession = async (dayId) => {
        const dayRoutine = routine.find(d => d.id === dayId);
        if (!dayRoutine) return;

        // Create session in DB immediately
        const sessionPayload = {
            user_id: user.id,
            workout_day_id: dayId,
            date: new Date().toISOString(),
            duration: 0,
            general_notes: ''
        };

        const { data: dbSession, error } = await supabase
            .from('workout_sessions')
            .insert([sessionPayload])
            .select()
            .single();

        if (error) {
            console.error('Error creating session:', error);
            return;
        }

        const newSession = {
            id: dbSession.id, // Use DB session ID
            dbSessionId: dbSession.id,
            date: Date.now(),
            dayOfWeek: dayRoutine.day_of_week || dayRoutine.dayOfWeek,
            dayName: dayRoutine.name,
            workoutDayId: dayId,
            startTime: Date.now(),
            exercises: dayRoutine.exercises.map(ex => ({
                exerciseId: ex.exerciseId,
                targetSets: ex.targetSets,
                targetReps: ex.targetReps,
                restSeconds: ex.restSeconds,
                setType: ex.setType || 'normal',
                exerciseNotes: ex.notes || '',
                sets: Array(ex.targetSets).fill(null).map((_, i) => ({
                    setNumber: i + 1,
                    weight: 0,
                    reps: 0,
                    rir: 2,
                    completed: false
                })),
                notes: '',
                savedToDb: false // Track if saved
            })),
            generalNotes: ''
        };
        setActiveSession(newSession);
    };

    const updateSessionSet = (exerciseIndex, setIndex, data) => {
        if (!activeSession) return;
        const updatedExercises = [...activeSession.exercises];
        updatedExercises[exerciseIndex].sets[setIndex] = {
            ...updatedExercises[exerciseIndex].sets[setIndex],
            ...data
        };
        setActiveSession({ ...activeSession, exercises: updatedExercises });
    };

    // Save a single exercise to DB (called when moving to next exercise)
    const saveExerciseToDb = async (exerciseIndex) => {
        if (!activeSession || !activeSession.dbSessionId) return;
        
        const ex = activeSession.exercises[exerciseIndex];
        if (!ex || ex.savedToDb) return; // Already saved

        // Get exercise name
        const { data: exDef } = await supabase.from('exercises').select('name').eq('id', ex.exerciseId).single();
        const exName = exDef?.name || 'Ejercicio';

        // Create performed_exercise
        const { data: perfEx, error: perfExError } = await supabase
            .from('performed_exercises')
            .insert([{
                session_id: activeSession.dbSessionId,
                exercise_id: ex.exerciseId,
                exercise_name: exName,
                notes: ex.notes || ex.exerciseNotes || ''
            }])
            .select()
            .single();

        if (perfExError) {
            console.error('Error saving exercise:', perfExError);
            return;
        }

        // Save all sets with data
        const setsToSave = ex.sets
            .filter(s => s.completed || (s.weight > 0 && s.reps > 0))
            .map(s => ({
                performed_exercise_id: perfEx.id,
                set_number: s.setNumber,
                weight: s.weight,
                reps: s.reps,
                rir: s.rir,
                completed: s.completed
            }));

        if (setsToSave.length > 0) {
            const { error: setsError } = await supabase.from('performed_sets').insert(setsToSave);
            if (setsError) {
                console.error('Error saving sets:', setsError);
            }
        }

        // Mark as saved
        const updatedExercises = [...activeSession.exercises];
        updatedExercises[exerciseIndex].savedToDb = true;
        updatedExercises[exerciseIndex].dbPerformedExerciseId = perfEx.id;
        setActiveSession({ ...activeSession, exercises: updatedExercises });

        console.log(`✅ Ejercicio guardado: ${exName}`);
    };

    const addSetToExercise = (exerciseIndex) => {
        if (!activeSession) return;
        const updatedExercises = [...activeSession.exercises];
        const currentSets = updatedExercises[exerciseIndex].sets;
        const newSetNumber = currentSets.length + 1;
        
        // Copy weight from last set if available
        const lastSet = currentSets[currentSets.length - 1];
        
        updatedExercises[exerciseIndex].sets.push({
            setNumber: newSetNumber,
            weight: lastSet?.weight || 0,
            reps: 0,
            rir: 2,
            completed: false
        });
        setActiveSession({ ...activeSession, exercises: updatedExercises });
    };

    const addExerciseToSession = async (exerciseId, addToRoutine = false) => {
        if (!activeSession) return;
        
        // Get exercise details
        const { data: exDef } = await supabase.from('exercises').select('*').eq('id', exerciseId).single();
        if (!exDef) return;

        const newExercise = {
            exerciseId: exerciseId,
            targetSets: 3,
            targetReps: '8-12',
            restSeconds: 90,
            setType: 'normal',
            exerciseNotes: '',
            sets: [{
                setNumber: 1,
                weight: 0,
                reps: 0,
                rir: 2,
                completed: false
            }],
            notes: '',
            isExtra: true // Mark as added during session
        };

        setActiveSession({
            ...activeSession,
            exercises: [...activeSession.exercises, newExercise]
        });

        // Optionally add to the routine permanently
        if (addToRoutine && activeSession.workoutDayId) {
            await addExerciseToDay(activeSession.workoutDayId, exerciseId);
        }

        return newExercise;
    };

    const replaceExerciseInSession = (exerciseIndex, newExerciseId) => {
        if (!activeSession || exerciseIndex < 0 || exerciseIndex >= activeSession.exercises.length) return;
        
        const updatedExercises = [...activeSession.exercises];
        updatedExercises[exerciseIndex] = {
            ...updatedExercises[exerciseIndex],
            exerciseId: newExerciseId,
            savedToDb: false // Reset so it saves with new exercise
        };
        
        setActiveSession({ ...activeSession, exercises: updatedExercises });
    };

    const finishSession = async () => {
        if (!activeSession) return;

        // Save any unsaved exercises first
        for (let i = 0; i < activeSession.exercises.length; i++) {
            if (!activeSession.exercises[i].savedToDb) {
                await saveExerciseToDb(i);
            }
        }

        // Update session duration
        if (activeSession.dbSessionId) {
            await supabase
                .from('workout_sessions')
                .update({
                    duration: Math.round((Date.now() - activeSession.startTime) / 60000),
                    general_notes: activeSession.generalNotes
                })
                .eq('id', activeSession.dbSessionId);
        }

        // Refresh History
        fetchHistory();
        setActiveSession(null);
    };

    const cancelSession = () => {
        setActiveSession(null);
    };

    const getDayName = (dayIndex) => {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return days[dayIndex];
    }

    const value = {
        routine,
        history,
        loading,
        activeSession,
        updateDayRoutine,
        addExerciseToDay,
        updateDayExercise,
        removeExerciseFromDay,
        startSession,
        updateSessionSet,
        addSetToExercise,
        addExerciseToSession,
        replaceExerciseInSession,
        saveExerciseToDb,
        finishSession,
        cancelSession,
        getDayName
    };

    return (
        <WorkoutContext.Provider value={value}>
            {children}
        </WorkoutContext.Provider>
    );
}
