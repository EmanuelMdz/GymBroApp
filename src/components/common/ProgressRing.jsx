import React from 'react';
import { cn } from '../../utils/cn';

export function ProgressRing({
    progress = 0,
    size = 60,
    strokeWidth = 4,
    color = "text-brand-lime",
    trackColor = "text-white/10",
    label,
    className
}) {
    const radius = size / 2 - strokeWidth;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90"
            >
                {/* Track */}
                <circle
                    className={trackColor}
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progress */}
                <circle
                    className={cn("transition-all duration-1000 ease-out", color)}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            {label && (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                    {label}
                </div>
            )}
        </div>
    );
}
