"use client";

import { useSearchParams } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import BrokerRebateSetupForm from "./BrokerRebateSetupForm";
import BrokerRebateSetupLayout from "./BrokerRebateSetupLayout";
import BrokerRebateTransferForm from "./BrokerRebateTransferForm";
import BrokerRebatePartner from "./BrokerRebatePartner";
import type { SetupFormData } from "./setupFormData";

export type RebateBroker = Pick<SetupFormData, "trading_name" | "logo"> & { broker_id: number };

type Props = {
  broker: RebateBroker;
  brokerSlug: string;
  locale: string;
  brokerType: string;
  formData: SetupFormData;
};

export default function BrokerRebateDetail({
  broker,
  brokerSlug,
  locale,
  brokerType,
  formData,
}: Props) {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const setupType = type === "transfer" || type === "partner" ? type : "new";

  return (
    <BrokerRebateSetupLayout
      broker={broker}
      locale={locale}
      brokerType={brokerType}
      setupType={setupType}
    >
      {setupType === "partner" ? (
        <BrokerRebatePartner links={formData.sub_ib_links} notes={formData.sub_ib_notes} />
      ) : setupType === "transfer" ? (
        <BrokerRebateTransferForm key={`${broker.broker_id}:${locale}`} brokerId={broker.broker_id} brokerName={broker.trading_name} brokerSlug={brokerSlug} locale={locale} data={formData} />
      ) : (
        <BrokerRebateSetupForm key={`${broker.broker_id}:${locale}`} brokerId={broker.broker_id} brokerName={broker.trading_name} brokerSlug={brokerSlug} locale={locale} data={formData} />
      )}
      <Toaster />
    </BrokerRebateSetupLayout>
  );
}
