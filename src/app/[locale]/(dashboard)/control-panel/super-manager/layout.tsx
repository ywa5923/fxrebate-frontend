import { Suspense } from 'react';
import SuperManagerLayoutShell from './SuperManagerLayoutShell';

export default async function SuperManagerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuperManagerLayoutShell params={params}>
        {children}
      </SuperManagerLayoutShell>
    </Suspense>
  );
}
