
'use client';

import React from 'react';
import type { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Wallet, LogOut } from 'lucide-react';

interface GameHeaderProps {
    balance: number;
    user: User | null;
    signOut: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ balance, user, signOut }) => {
    return (
        <header className="w-full flex justify-between items-center px-4 py-2 shrink-0">
            <div className="flex items-center gap-4">
                <Card className="p-2 px-4 bg-card/50 backdrop-blur-sm border-accent/30">
                    <div className="flex items-center gap-2 text-xl font-bold">
                        <Wallet className="text-accent" />
                        <span>${balance.toLocaleString()}</span>
                    </div>
                </Card>
            </div>
            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                                <AvatarFallback>
                                    {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.displayName}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={signOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button variant="outline" onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Exit Guest Mode
                </Button>
            )}
        </header>
    );
};
