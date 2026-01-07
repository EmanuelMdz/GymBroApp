import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    className,
    isLoading,
    disabled,
    type = 'button',
    ...props
}) {
    const variants = {
        primary: 'bg-brand-lime hover:bg-brand-lime/90 text-brand-dark font-bold shadow-[0_0_20px_rgba(212,240,100,0.3)]',
        secondary: 'bg-brand-purple hover:bg-brand-purple/90 text-brand-dark font-bold',
        outline: 'border-2 border-brand-lime text-brand-lime hover:bg-brand-lime/10',
        ghost: 'hover:bg-white/10 text-white',
        danger: 'bg-danger hover:bg-red-600 text-white',
        success: 'bg-brand-lime hover:opacity-90 text-brand-dark', // Aligned success to brand
    };

    const sizes = {
        sm: 'h-8 px-4 text-xs',
        md: 'h-12 px-6 text-sm',
        lg: 'h-14 px-8 text-base',
        icon: 'h-12 w-12 p-0 flex items-center justify-center',
    };

    return (
        <button
            type={type}
            className={cn(
                'inline-flex items-center justify-center rounded-full font-bold tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-lime focus:ring-offset-2 focus:ring-offset-brand-dark disabled:opacity-50 disabled:pointer-events-none active:scale-95',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
}
