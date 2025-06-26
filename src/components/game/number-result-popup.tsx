
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface NumberResultPopupProps {
    winningSegment: { label: string; };
    onComplete: () => void;
    customTextureUrl?: string;
    totalWinnings: number;
}

export function NumberResultPopup({ winningSegment, onComplete, customTextureUrl, totalWinnings }: NumberResultPopupProps) {
    const [isCompleted, setIsCompleted] = useState(false);

    const handleComplete = () => {
        if (isCompleted) return;
        setIsCompleted(true);
        onComplete();
    };
    
    // Automatically complete after a few seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            handleComplete();
        }, 4000); // show for 4 seconds
        return () => clearTimeout(timer);
    }, []);

    const cardStyle: React.CSSProperties = {};
    if (customTextureUrl) {
        cardStyle.backgroundImage = `url(${customTextureUrl})`;
        cardStyle.backgroundSize = 'cover';
        cardStyle.backgroundPosition = 'center';
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in p-4">
            <Card
                className="w-full max-w-md text-center overflow-hidden border-4 border-accent relative"
                style={cardStyle}
            >
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" />
                <CardContent className="relative z-10 flex flex-col items-center justify-center gap-4 min-h-[300px] p-6">
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
                    <Button onClick={handleComplete} disabled={isCompleted} className="mt-4">
                        Continue
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
