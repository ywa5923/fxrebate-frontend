import { Suspense } from 'react';
import SiteLayoutShell from './SiteLayoutShell';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Record<string, string>>;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SiteLayoutShell params={params}>{children}</SiteLayoutShell>
    </Suspense>
  );
}
