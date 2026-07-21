import { Suspense } from "react";
import LogoLayoutSkeleton from "@/components/LogoLayoutSkeleton";
import BrokerProfileLayoutShell from "./BrokerProfileLayoutShell";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ brokerId: string, locale: string }>;
}) {
  
  return (
    <Suspense fallback={<LogoLayoutSkeleton />}>
      <BrokerProfileLayoutShell params={params}>
        {children}
      </BrokerProfileLayoutShell>
    </Suspense>
  );
}