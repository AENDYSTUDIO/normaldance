"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { logger } from "@/lib/utils/logger";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to monitoring service
    logger.error("Global error occurred", error, {
      digest: error.digest,
      stack: error.stack,
    });

    // Send to Sentry with dynamic import to avoid OpenTelemetry conflicts
    const sendToSentry = async () => {
      if (process.env.NODE_ENV !== "development") {
        try {
          const Sentry = await import("@sentry/nextjs");
          Sentry.captureException(error, {
            tags: {
              component: "global-error",
            },
            extra: {
              digest: error.digest,
            },
          });
        } catch (sentryError) {
          logger.error("Failed to send error to Sentry", sentryError);
        }
      }
    };

    sendToSentry();
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex items-center justify-center min-h-screen p-4 bg-background">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle>Something went wrong!</CardTitle>
              </div>
              <CardDescription>
                A critical error occurred. We're sorry for the inconvenience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === "development" && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-mono text-destructive">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Digest: {error.digest}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={reset} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/")}
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                If the problem persists, please contact our support team.
              </p>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
