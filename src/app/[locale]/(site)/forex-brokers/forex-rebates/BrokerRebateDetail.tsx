"use client";

import type { HighestRebateBroker } from "@/types";
import type { SiteBrokerType } from "./data";
import BrokerRebateSetupForm from "./BrokerRebateSetupForm";
import BrokerRebateSetupLayout from "./BrokerRebateSetupLayout";
import type { SetupFormOptions } from "./setupFormData";

type Props = {
  broker: HighestRebateBroker;
  locale: string;
  brokerType: SiteBrokerType;
  formOptions: SetupFormOptions;
};

export default function BrokerRebateDetail({
  broker,
  locale,
  brokerType,
  formOptions,
}: Props) {
  return (
    <BrokerRebateSetupLayout
      broker={broker}
      locale={locale}
      brokerType={brokerType}
    >
      <BrokerRebateSetupForm broker={broker} options={formOptions} />
    </BrokerRebateSetupLayout>
  );
}
