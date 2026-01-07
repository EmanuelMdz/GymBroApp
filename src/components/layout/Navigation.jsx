import React from 'react';
import { NavLink } from 'react-router-dom';
import { Dumbbell, Calendar, BarChart2, Home } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Navigation() {
    const navItems = [
        { to: '/', label: 'Hoy', icon: Home },
        { to: '/routine', label: 'Rutina', icon: Calendar },
        { to: '/exercises', label: 'Ejercicios', icon: Dumbbell },
        { to: '/stats', label: 'Progreso', icon: BarChart2 },
    ];

    return (
        <nav className="fixed bottom-6 left-4 right-4 z-40 bg-brand-card/95 backdrop-blur-md border border-white/5 shadow-2xl rounded-3xl pb-0">
            <div className="flex justify-around items-center h-20">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => cn(
                            "flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all duration-300 relative group",
                            isActive
                                ? "text-brand-lime"
                                : "text-gray-400 hover:text-white"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <div className={cn(
                                    "p-2 rounded-full transition-all duration-300",
                                    isActive ? "bg-brand-lime/10 translate-y-[-4px]" : "translate-y-0"
                                )}>
                                    <Icon className={cn("h-6 w-6", isActive && "fill-current")} />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-bold tracking-wide transition-opacity",
                                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                )}>
                                    {label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
