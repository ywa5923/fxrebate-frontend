"use client";

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { logoutUser } from '@/lib/auth-actions';

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      className={className}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            await logoutUser();
          } finally {
            router.push('/en');
          }
        })
      }
    >
      {isPending ? 'Logging out...' : 'Logout'}
    </Button>
  );
}


