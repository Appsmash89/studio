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
                "fixed top-1/4 left-1/2 -translate-x-1/2 w-[100px] h-[100px] z-50 flex flex-col items-center justify-center p-6 text-center text-white transition-opacity duration-500 pointer-events-none",
                isVisible ? 'opacity-100' : 'opacity-0'
            )}
            style={containerStyle}
        >
            {/* This component is now purely for displaying a texture. */}
        </div>
    );
}
