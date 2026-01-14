import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X } from 'lucide-react';
import { Button } from '../common/Button';

export function RestTimer({ initialTime = 90, className }) {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play sound
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
            audio.play().catch(e => console.log('Audio play failed', e));
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggle = () => setIsActive(!isActive);
    const reset = () => {
        setIsActive(false);
        setTimeLeft(initialTime);
    };
    const addTime = (seconds) => setTimeLeft(prev => prev + seconds);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };


    return (
        <div className={`bg-brand-card border border-white/10 p-3 rounded-2xl flex items-center justify-between shadow-2xl ${className || ''}`}>
            <div className="flex items-center space-x-4">
                <div className="text-2xl font-mono font-bold w-16 text-center">{formatTime(timeLeft)}</div>
                <div className="flex space-x-2">
                    <Button size="icon" variant="ghost" onClick={toggle} className="h-8 w-8">
                        {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={reset} className="h-8 w-8">
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="flex space-x-2">
                <Button size="sm" variant="secondary" onClick={() => addTime(30)}>+30s</Button>
                <Button size="sm" variant="secondary" onClick={() => addTime(-30)}>-30s</Button>
            </div>
        </div>
    );
}
