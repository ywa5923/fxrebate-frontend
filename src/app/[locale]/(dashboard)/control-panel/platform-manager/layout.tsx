import { Suspense } from 'react';
import PlatformManagerLayoutShell from './PlatformManagerLayoutShell';

export default async function PlatformManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlatformManagerLayoutShell>{children}</PlatformManagerLayoutShell>
    </Suspense>
  );
}
