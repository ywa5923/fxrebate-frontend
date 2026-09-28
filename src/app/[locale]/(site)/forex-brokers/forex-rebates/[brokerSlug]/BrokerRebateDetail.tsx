"use client";

import type { HighestRebateBroker } from "@/types";
import type { RebateSetupType, SiteBrokerType } from "../data";
import BrokerRebateSetupForm from "./BrokerRebateSetupForm";
import BrokerRebateSetupLayout from "./BrokerRebateSetupLayout";
import BrokerRebateTransferForm from "./BrokerRebateTransferForm";
import BrokerRebatePartner from "./BrokerRebatePartner";
import type { SetupFormOptions } from "./setupFormData";

type Props = {
  broker: HighestRebateBroker;
  locale: string;
  brokerType: SiteBrokerType;
  setupType: RebateSetupType;
  formOptions: SetupFormOptions;
};

export default function BrokerRebateDetail({
  broker,
  locale,
  brokerType,
  setupType,
  formOptions,
}: Props) {
  return (
    <BrokerRebateSetupLayout
      broker={broker}
      locale={locale}
      brokerType={brokerType}
      setupType={setupType}
    >
      {setupType === "partner" ? (
        <BrokerRebatePartner />
      ) : setupType === "transfer" ? (
        <BrokerRebateTransferForm broker={broker} options={formOptions} />
      ) : (
        <BrokerRebateSetupForm broker={broker} options={formOptions} />
      )}
    </BrokerRebateSetupLayout>
  );
}
