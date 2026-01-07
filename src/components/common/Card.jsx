import React from 'react';
import { cn } from '../../utils/cn';

export function Card({ className, children, ...props }) {
    return (
        <div
            className={cn(
                'rounded-[32px] border border-white/5 bg-brand-card p-6 shadow-sm relative overflow-hidden',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, children, ...props }) {
    return (
        <div
            className={cn('mb-4 flex flex-col space-y-1.5', className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardTitle({ className, children, ...props }) {
    return (
        <h3
            className={cn('text-lg font-semibold leading-none tracking-tight text-text-primary', className)}
            {...props}
        >
            {children}
        </h3>
    );
}

export function CardContent({ className, children, ...props }) {
    return (
        <div className={cn('', className)} {...props}>
            {children}
        </div>
    );
}
