
import { Suspense } from "react";
import BrokerProfileLayoutShell from "./BrokerProfileLayoutShell";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ brokerId: string, locale: string }>;
}) {
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrokerProfileLayoutShell params={params}>
        {children}
      </BrokerProfileLayoutShell>
    </Suspense>
  );
}