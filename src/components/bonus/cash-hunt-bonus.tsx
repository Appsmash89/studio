
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BonusGameProps {
    betAmount: number;
    onComplete: (winnings: number) => void;
}

export function CashHuntBonus({ betAmount, onComplete }: BonusGameProps) {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in">
            <Card className="w-96">
                <CardHeader>
                    <CardTitle className="text-center text-accent">Cash Hunt Bonus!</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <p>You bet ${betAmount.toLocaleString()} on Cash Hunt.</p>
                    <p className="text-muted-foreground text-center">This bonus game is under construction. Click below to simulate a win.</p>
                    <Button onClick={() => onComplete(betAmount * 20)}>Simulate Win (20x)</Button>
                </CardContent>
            </Card>
        </div>
    )
}
