/**
 * @typedef {Object} Exercise
 * @property {string} id - UUID unique
 * @property {string} name - Name of the exercise
 * @property {'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core'} muscleGroup
 * @property {'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight'} equipment
 * @property {string} [notes] - Personal notes
 * @property {number} createdAt - Timestamp
 */

/**
 * @typedef {Object} WorkoutSetTarget
 * @property {string} exerciseId
 * @property {number} order
 * @property {number} targetSets
 * @property {string} targetReps - e.g. "8-12"
 * @property {number} restSeconds
 */

/**
 * @typedef {Object} WorkoutDay
 * @property {string} id
 * @property {number} dayOfWeek - 0-6 (Sunday-Saturday)
 * @property {string} name - e.g. "Push Day"
 * @property {WorkoutSetTarget[]} exercises
 */

/**
 * @typedef {Object} PerformedSet
 * @property {number} setNumber
 * @property {number} weight - kg
 * @property {number} reps
 * @property {number} rir - -1 to 5+
 * @property {boolean} completed
 * @property {string} [notes]
 */

/**
 * @typedef {Object} PerformedExercise
 * @property {string} exerciseId
 * @property {string} exerciseName
 * @property {PerformedSet[]} sets
 * @property {string} [notes]
 */

/**
 * @typedef {Object} WorkoutSession
 * @property {string} id
 * @property {number} date - Timestamp
 * @property {number} dayOfWeek
 * @property {string} workoutDayId
 * @property {number} duration - minutes
 * @property {PerformedExercise[]} exercises
 * @property {string} [generalNotes]
 * @property {number} createdAt
 */

export const INITIAL_EXERCISES = [
    { id: '1', name: 'Press de Banca', muscleGroup: 'chest', equipment: 'barbell', createdAt: Date.now() },
    { id: '2', name: 'Sentadilla', muscleGroup: 'legs', equipment: 'barbell', createdAt: Date.now() },
    { id: '3', name: 'Dominadas', muscleGroup: 'back', equipment: 'bodyweight', createdAt: Date.now() },
];

export const MUSCLE_GROUPS = {
    chest: { label: 'Pecho', color: '#ef4444' },
    back: { label: 'Espalda', color: '#3b82f6' },
    legs: { label: 'Piernas', color: '#22c55e' },
    shoulders: { label: 'Hombros', color: '#f59e0b' },
    arms: { label: 'Brazos', color: '#a855f7' },
    core: { label: 'Core', color: '#06b6d4' },
};
