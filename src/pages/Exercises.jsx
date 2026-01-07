import React from 'react';
import { ExerciseList } from '../components/exercises/ExerciseList';

export default function Exercises() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Ejercicios</h1>
            <ExerciseList />
        </div>
    );
}
