import React from 'react';
import { useWorkout } from '../../contexts/WorkoutContext';
import { useExercises } from '../../contexts/ExerciseContext';
import { Button } from './Button';
import { Download, Upload } from 'lucide-react';

export function DataManagement() {
    const { routine, history } = useWorkout();
    const { exercises } = useExercises();

    const handleExport = () => {
        const data = {
            routine,
            history,
            exercises,
            exportDate: Date.now()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gymtracker-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.exercises && data.routine && data.history) {
                    if (confirm('Esto sobrescribirá tus datos actuales. ¿Estás seguro?')) {
                        localStorage.setItem('gymtracker-exercises', JSON.stringify(data.exercises));
                        localStorage.setItem('gymtracker-routine', JSON.stringify(data.routine));
                        localStorage.setItem('gymtracker-history', JSON.stringify(data.history));
                        window.location.reload();
                    }
                } else {
                    alert('Formato de archivo inválido');
                }
            } catch (error) {
                alert('Error al leer el archivo');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex space-x-2">
            <Button variant="outline" className="flex-1 text-xs" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" /> Exportar Datos
            </Button>
            <div className="relative flex-1">
                <input
                    type="file"
                    accept=".json"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleImport}
                />
                <Button variant="outline" className="w-full text-xs pointer-events-none">
                    <Upload className="mr-2 h-4 w-4" /> Importar Backup
                </Button>
            </div>
        </div>
    );
}
