import React from 'react';
import { Check, MoreHorizontal } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Input } from '../common/Input';

export function SetRow({ setNumber, weight, reps, rir, completed, onUpdate, previousSet, className: externalClassName }) {
    const rirOptions = [
        { val: -1, label: 'Fallé', color: 'bg-red-500' },
        { val: 0, label: '@0', color: 'bg-red-500' },
        { val: 1, label: '@1', color: 'bg-amber-500' },
        { val: 2, label: '@2', color: 'bg-amber-500' },
        { val: 3, label: '@3', color: 'bg-emerald-500' },
        { val: 4, label: '@4', color: 'bg-emerald-500' },
        { val: 5, label: '@5+', color: 'bg-emerald-500' },
    ];

    return (
        <div className={cn(
            "grid grid-cols-[30px_1fr_1fr_1fr_40px] gap-2 items-center py-2 border-b border-white/5 last:border-0",
            completed && "opacity-60",
            externalClassName
        )}>
            <span className="text-xs text-gray-400 font-bold text-center">{setNumber}</span>

            <div className="relative">
                <Input
                    className="h-8 text-center text-sm p-1 bg-white/5 border-white/10 text-white rounded-md focus:border-brand-lime focus:ring-1 focus:ring-brand-lime"
                    type="number"
                    step="0.5"
                    value={weight === 0 ? '' : weight}
                    onChange={(e) => onUpdate({ weight: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                    placeholder={previousSet ? String(previousSet.weight) : '0'}
                />
                <span className="absolute right-1 top-1.5 text-[10px] text-gray-500">kg</span>
            </div>

            <div className="relative">
                <Input
                    className="h-8 text-center text-sm p-1 bg-white/5 border-white/10 text-white rounded-md focus:border-brand-lime focus:ring-1 focus:ring-brand-lime"
                    type="number"
                    value={reps === 0 ? '' : reps}
                    onChange={(e) => onUpdate({ reps: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                    placeholder={previousSet ? String(previousSet.reps) : '0'}
                />
                <span className="absolute right-1 top-1.5 text-[10px] text-gray-500">reps</span>
            </div>

            <select
                className={cn(
                    "h-8 rounded-md text-xs px-1 focus:outline-none border border-white/10 bg-white/5 text-white text-center appearance-none cursor-pointer hover:bg-white/10 transition-colors",
                )}
                value={rir}
                onChange={(e) => onUpdate({ rir: parseInt(e.target.value) })}
            >
                {rirOptions.map(opt => (
                    <option key={opt.val} value={opt.val} className="bg-brand-card text-white">{opt.label}</option>
                ))}
            </select>

            <button
                onClick={() => onUpdate({ completed: !completed })}
                className={cn(
                    "w-6 h-6 rounded flex items-center justify-center border transition-all duration-200",
                    completed
                        ? "bg-brand-lime border-brand-lime text-brand-dark"
                        : "border-white/10 bg-white/5 hover:border-brand-lime hover:text-brand-lime text-transparent"
                )}
            >
                <Check className="h-4 w-4" />
            </button>

        </div>
    );
}
