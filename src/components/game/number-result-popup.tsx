'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface NumberResultPopupProps {
    winningSegment: { label: string; };
    onComplete: () => void;
    customTextureUrl?: string;
    totalWinnings: number;
}

export function NumberResultPopup({ winningSegment, onComplete, customTextureUrl, totalWinnings }: NumberResultPopupProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Fade in
        const fadeInTimer = setTimeout(() => setIsVisible(true), 100);

        // Start fade out after 2 seconds
        const fadeOutTimer = setTimeout(() => {
            setIsVisible(false);
        }, 2100);

        // Complete the action after the fade-out completes (500ms transition)
        const completeTimer = setTimeout(() => {
            onComplete();
        }, 2600);

        return () => {
            clearTimeout(fadeInTimer);
            clearTimeout(fadeOutTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    const containerStyle: React.CSSProperties = {};
    if (customTextureUrl) {
        containerStyle.backgroundImage = `url(${customTextureUrl})`;
        containerStyle.backgroundSize = 'contain';
        containerStyle.backgroundRepeat = 'no-repeat';
        containerStyle.backgroundPosition = 'center';
    }

    return (
        <div 
            className={cn(
                "fixed top-1/4 left-1/2 -translate-x-1/2 w-[200px] h-[200px] z-50 flex flex-col items-center justify-center p-6 text-center text-white transition-opacity duration-500 pointer-events-none",
                isVisible ? 'opacity-100' : 'opacity-0'
            )}
            style={containerStyle}
        >
            {/* If no custom texture, provide a fallback visual */}
            {!customTextureUrl && (
                <div className='contents'>
                    <p className="text-2xl font-bold text-foreground">The winner is</p>
                    <p
                        className="text-8xl font-headline text-accent"
                        style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.5)' }}
                    >
                        {winningSegment.label}
                    </p>
                    {totalWinnings > 0 && (
                        <div className="mt-4">
                            <p className="text-xl font-semibold">You won</p>
                            <p className="text-4xl font-bold text-accent">${totalWinnings.toLocaleString()}</p>
                        </div>
                    )}
                </div>
            )}
            
            {/* If there IS a texture, you can still overlay text if desired */}
            {customTextureUrl && (
                 <div className='contents'>
                    <p
                        className="text-8xl font-headline text-accent opacity-0" // Example: hide default text when texture is present
                    >
                        {winningSegment.label}
                    </p>
                 </div>
            )}
        </div>
    );
}
