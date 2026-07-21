import { Suspense } from 'react';
import LogoLayoutSkeleton from '@/components/LogoLayoutSkeleton';
import PlatformManagerLayoutShell from './PlatformManagerLayoutShell';

export default async function PlatformManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LogoLayoutSkeleton />}>
      <PlatformManagerLayoutShell>{children}</PlatformManagerLayoutShell>
    </Suspense>
  );
}
