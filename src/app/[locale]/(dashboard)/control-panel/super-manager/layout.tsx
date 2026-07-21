import { Suspense } from 'react';
import LogoLayoutSkeleton from '@/components/LogoLayoutSkeleton';
import SuperManagerLayoutShell from './SuperManagerLayoutShell';

export default async function SuperManagerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return (
    <Suspense fallback={<LogoLayoutSkeleton />}>
      <SuperManagerLayoutShell params={params}>
        {children}
      </SuperManagerLayoutShell>
    </Suspense>
  );
}
