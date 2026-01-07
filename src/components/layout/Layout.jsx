import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';

export function Layout() {
    return (
        <div className="min-h-screen bg-background text-text-primary font-sans flex flex-col selection:bg-brand-lime selection:text-brand-dark">
            <main className="flex-1 pb-32 px-5 pt-6 max-w-2xl mx-auto w-full">
                <Outlet />
            </main>
            <Navigation />
        </div>
    );
}
