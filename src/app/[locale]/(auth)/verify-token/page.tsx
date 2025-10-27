"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authenticateWithMagicLink } from "@/lib/auth-actions";
import logger from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface VerifyMagicLinkTokenResult {
  success: boolean;
  message: string;
  redirectTo: string;
}

export default function MagicLinkAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authLogger = logger.child('MagicLinkAuth');

  useEffect(() => {
    // Early return if already authenticating or not in loading state
    if (isAuthenticating || status !== 'loading') {
      return;
    }

    const authenticateUser = async () => {
      setIsAuthenticating(true);
      
      try {
        // Get token from URL parameters
        const token = searchParams.get('token');
        
        if (!token) {
          throw new Error('No authentication token provided');
        }

        authLogger.info('Starting magic link authentication', { 
          context: { 
            hasToken: !!token,
            tokenLength: token.length 
          } 
        });

        const result: VerifyMagicLinkTokenResult = await authenticateWithMagicLink(token);

        if (!result.success) {
          throw new Error(result.message);
        }

        authLogger.info('Magic link authentication successful');
        
        setStatus('success');
        setMessage('You will be redirected to dashboard');

        // Wait 2 seconds to show the success message, then redirect
      
        setTimeout(() => {
          router.push(result.redirectTo);
        }, 2000);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        
        authLogger.error('Magic link authentication failed', { 
          error: errorMessage,
          context: { 
            errorType: typeof error,
            errorStack: error instanceof Error ? error.stack : undefined
          }
        });
        
        setStatus('error');
        setError(errorMessage);
      } finally {
        setIsAuthenticating(false);
      }
    };

    authenticateUser();

  }, [searchParams]);

  const handleRetry = () => {
    setStatus('loading');
    setError('');
    setMessage('');
    setIsAuthenticating(false);
    // Retry authentication
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push('/en');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Magic Link Authentication</CardTitle>
          <CardDescription>
            Verifying your authentication token...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Authenticating your magic link...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <div className="relative w-full rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                <p className="text-sm text-green-800 font-medium">
                  {message}
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="relative w-full rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">
                  {error}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button 
                  onClick={handleRetry} 
                  variant="outline" 
                  className="flex-1 h-12 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Loader2 className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={handleGoHome} 
                  className="flex-1 h-12 bg-gradient-to-r from-green-700 to-emerald-800 hover:from-green-800 hover:to-emerald-900 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Go Home
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
