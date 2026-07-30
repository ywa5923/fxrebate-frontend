import { Suspense } from 'react';
import LogoLayoutSkeleton from '@/components/LogoLayoutSkeleton';
import SiteLayoutShell from './SiteLayoutShell';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Record<string, string>>;
}) {
  return (
    <Suspense fallback={<LogoLayoutSkeleton />}>
      <SiteLayoutShell params={params}>{children}</SiteLayoutShell>
    </Suspense>
  );
}
