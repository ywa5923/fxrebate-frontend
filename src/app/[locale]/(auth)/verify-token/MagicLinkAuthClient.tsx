"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";

import { authenticateWithMagicLink } from "@/lib/auth-actions";
import logger from "@/lib/logger";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VerifyMagicLinkTokenResult {
  success: boolean;
  message: string;
  redirectTo: string;
}

type AuthenticationStatus = "loading" | "success" | "error";

const authLogger = logger.child("MagicLinkAuth");

export default function MagicLinkAuthClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [status, setStatus] =
    useState<AuthenticationStatus>("loading");

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const authenticationStarted = useRef(false);

  useEffect(() => {
    if (authenticationStarted.current) {
      return;
    }

    authenticationStarted.current = true;

    let cancelled = false;

    const authenticateUser = async (): Promise<void> => {
      try {
        if (!token) {
          throw new Error("No authentication token was provided.");
        }

        authLogger.info("Starting magic link authentication", {
          context: {
            hasToken: true,
            tokenLength: token.length,
          },
        });

        const result: VerifyMagicLinkTokenResult =
          await authenticateWithMagicLink(token);

        if (!result.success) {
          throw new Error(
            result.message || "Magic link authentication failed.",
          );
        }

        if (cancelled) {
          return;
        }

        authLogger.info("Magic link authentication successful", {
          context: {
            redirectTo: result.redirectTo,
          },
        });

        setStatus("success");
        setMessage(
          result.message ||
            "Authentication successful! Redirecting...",
        );

        window.setTimeout(() => {
          router.replace(result.redirectTo);
        }, 2000);
      } catch (caughtError) {
        if (cancelled) {
          return;
        }

        const resolvedErrorMessage =
          caughtError instanceof Error
            ? caughtError.message
            : "Authentication failed.";

        authLogger.error("Magic link authentication failed", {
          error: resolvedErrorMessage,
        });

        setStatus("error");
        setErrorMessage(resolvedErrorMessage);
      }
    };

    void authenticateUser();

    return () => {
      cancelled = true;
    };
  }, [router, token]);

  const handleRetry = (): void => {
    window.location.reload();
  };

  const handleGoHome = (): void => {
    router.replace("/en");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Magic Link Authentication
          </CardTitle>

          <CardDescription>
            Verifying your authentication token...
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Authenticating your magic link...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />

              <div className="w-full rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                <p className="text-sm font-medium text-green-800">
                  {message}
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-8 w-8 text-red-600" />

              <div className="w-full rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">
                  {errorMessage}
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  onClick={handleRetry}
                  variant="outline"
                  className="h-12 flex-1"
                >
                  Try Again
                </Button>

                <Button
                  type="button"
                  onClick={handleGoHome}
                  className="h-12 flex-1"
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