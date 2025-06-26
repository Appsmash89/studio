
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { SEGMENTS_CONFIG } from '@/config/game-config';
import { cn } from '@/lib/utils';

interface GameHistoryProps {
    spinHistory: (typeof SEGMENTS_CONFIG)[];
    customTextures: Record<string, string>;
}

export const GameHistory: React.FC<GameHistoryProps> = ({ spinHistory, customTextures }) => {
    return (
        <div className="h-20 flex items-center justify-center my-4">
            <Card className="bg-card/50 backdrop-blur-sm border-accent/30 p-2 shadow-lg">
                <CardContent className="p-0 flex items-center gap-3">
                    <p className="text-sm font-bold pr-3 border-r border-muted-foreground/50 self-stretch flex items-center text-muted-foreground">
                        History
                    </p>
                    <div className="flex gap-1.5">
                        {spinHistory.map((segment, index) => {
                            const customTexture = customTextures[`history-${segment.label}`];
                            const style: React.CSSProperties = {
                                color: 'transparent',
                                backgroundColor: 'transparent'
                            };

                            if (customTexture) {
                                style.backgroundImage = `url(${customTexture})`;
                                style.backgroundSize = 'cover';
                                style.backgroundPosition = 'center';
                            }

                            return (
                                <div
                                    key={`${segment.id}-${index}`}
                                    className={cn(
                                        "w-10 h-10 rounded-md flex items-center justify-center text-xs font-bold shadow-inner transition-all animate-in fade-in",
                                        !customTexture && 'bg-background/30'
                                    )}
                                    style={style}
                                    title={segment.label.replace('_', ' ')}
                                >
                                    <span className="text-center leading-tight">
                                        {segment.label.replace('_', '\n')}
                                    </span>
                                </div>
                            );
                        })}
                        {[...Array(Math.max(0, 7 - spinHistory.length))].map((_, i) => (
                            <div key={`placeholder-${i}`} className="w-10 h-10 rounded-md bg-background/30" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
