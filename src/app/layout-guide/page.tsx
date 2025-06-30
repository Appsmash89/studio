
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LayoutGuide() {
  return (
    <div className="bg-background min-h-screen text-foreground p-4 sm:p-8">
      <header className="flex items-center gap-4 mb-4">
        <Button asChild variant="outline" size="sm">
            <Link href="/">
                <ArrowLeft size={16} />
                Back to Game
            </Link>
        </Button>
        <h1 className="text-2xl font-bold text-accent">Game Component Layout Guide</h1>
      </header>
      <p className="text-muted-foreground mb-8">Use the names below to refer to different parts of the game UI when making requests.</p>
      
      <div className="relative border-2 border-dashed border-muted-foreground/50 p-4 rounded-lg max-w-7xl mx-auto min-h-[85vh]">
        
        <div className="absolute -top-3 -left-3 bg-background px-2 text-muted-foreground text-sm font-bold">Game Component (`src/app/game.tsx`)</div>

        <div className="relative h-16 border-2 border-blue-500/50 rounded mb-4 flex items-center justify-center">
          <div className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm font-semibold">
            GameHeader (`/src/components/game/game-header.tsx`)
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col items-center gap-4 border-2 border-dashed border-muted-foreground/20 p-4 rounded-md">
                <div className="relative h-24 border-2 border-green-500/50 rounded w-80 flex items-center justify-center">
                    <div className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-sm font-semibold">
                        TopSlot (`/src/components/top-slot.tsx`)
                    </div>
                </div>

                <div className="relative h-80 w-80 border-2 border-purple-500/50 rounded-full flex items-center justify-center">
                    <div className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-sm font-semibold">
                        Wheel (`/src/components/game/wheel.tsx`)
                    </div>
                </div>

                <div className="relative h-20 border-2 border-yellow-500/50 rounded w-full max-w-md flex items-center justify-center">
                     <div className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-sm font-semibold">
                        GameHistory (`/src/components/game/game-history.tsx`)
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 border-2 border-dashed border-muted-foreground/20 p-4 rounded-md">
                 <div className="relative h-32 border-2 border-cyan-500/50 rounded flex items-center justify-center">
                     <div className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded text-sm font-semibold">
                        GameStatusDisplay (`/src/components/game/game-status-display.tsx`)
                    </div>
                </div>
                
                <div className="relative border-2 border-red-500/50 rounded p-4 min-h-[400px]">
                    <div className="absolute -top-3 left-4 bg-background px-2 text-red-300 text-sm font-semibold">BettingInterface (`/src/components/game/betting-interface.tsx`)</div>

                    <div className="relative border-2 border-dashed border-red-400/30 rounded p-2 mt-8 h-48">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs font-semibold">Betting Options Grid</div>
                    </div>

                     <div className="relative flex items-center justify-between mt-4">
                        <div className="relative border-2 border-dashed border-red-400/30 rounded-full p-2 w-24 h-24 flex items-center justify-center">
                            <div className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs font-semibold text-center">Chip Selector (Sundial)</div>
                        </div>
                        <div className="relative border-2 border-dashed border-red-400/30 rounded p-2 h-16 w-40 flex items-center justify-center">
                             <div className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs font-semibold text-center">Total Bet Display</div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
        
        <div className="absolute bottom-4 left-4 right-4 h-28 border-2 border-gray-500/50 rounded mt-4 flex items-center justify-center">
            <div className="bg-gray-500/20 text-gray-300 px-2 py-1 rounded text-sm font-semibold">
                DevTools (`/src/components/dev/dev-tools.tsx`)
            </div>
        </div>
      </div>
    </div>
  );
}
