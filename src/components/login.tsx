'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

function AuthErrorAlert({ message }: { message: string | null }) {
    if (!message) return null;

    if (message === 'auth/unauthorized-domain') {
        return (
            <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Action Required: Authorize Your Domain</AlertTitle>
                <AlertDescription>
                    <p className="mb-2">Firebase is blocking sign-in because your app's domain isn't on its list of approved sites. This is a security feature.</p>
                    <p className="font-semibold">To fix this, you must:</p>
                    <ol className="list-decimal list-inside my-2 text-sm space-y-1">
                        <li>Go to your project in the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-medium">Firebase Console</a>.</li>
                        <li>Navigate to: <strong>Authentication</strong> &rarr; <strong>Settings</strong> tab.</li>
                        <li>Under <strong>Authorized domains</strong>, click <strong>Add domain</strong>.</li>
                        <li>
                            Copy and paste this exact domain:
                            <code className="ml-2 bg-background/50 text-foreground font-mono p-1 rounded-md">{typeof window !== 'undefined' ? window.location.hostname : ''}</code>
                        </li>
                    </ol>
                    <p className="text-xs text-muted-foreground">After adding the domain, refresh this page and try signing in again.</p>
                </AlertDescription>
            </Alert>
        );
    }
    
    // Fallback for other errors
    return (
        <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}

export default function Login() {
  const { signInWithGoogle, signInWithGitHub, signInAsGuest, authError } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-headline text-accent tracking-wider" style={{ textShadow: '2px 2px 4px hsl(var(--primary))' }}>
          SpinRiches
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">Sign in to start your adventure!</p>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome!</CardTitle>
          <CardDescription>
            Choose your preferred sign-in method below
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <AuthErrorAlert message={authError} />
          <Button onClick={signInWithGoogle} variant="outline">
            <Icons.google className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
          <Button onClick={signInWithGitHub} variant="outline">
            <Icons.gitHub className="mr-2 h-5 w-5" />
            Sign in with GitHub
          </Button>
           <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                Or
                </span>
            </div>
          </div>
          <Button onClick={signInAsGuest} variant="secondary">
            Play as Guest
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
