import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import MagicLinkAuthClient from "./MagicLinkAuthClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function MagicLinkAuthFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Magic Link Authentication
          </CardTitle>

          <CardDescription>
            Preparing authentication...
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading authentication details...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MagicLinkAuthPage() {
  return (
    <Suspense fallback={<MagicLinkAuthFallback />}>
      <MagicLinkAuthClient />
    </Suspense>
  );
}