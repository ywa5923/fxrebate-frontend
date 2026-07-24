import { apiClient } from "@/lib/api-client";
import logger from "@/lib/logger";
import { Option, OptionValue } from "@/types";
import { notFound } from "next/navigation";
import BrokerOptions from "./BrokerOptions";

type Props = {
  brokerId: number;
  categoryId: string;
  categorySlug: string;
  options: Option[];
  is_admin: boolean;
  can_edit: boolean;
};

export default async function MyBrokerOptions({
  brokerId,
  categoryId,
  categorySlug,
  options,
  is_admin,
  can_edit,
}: Props) {
  const log = logger.child("MyBrokerOptions");
  const optionsValuesFetchUrl = `/option-values/${brokerId}?entity_type=Broker&language_code=en&category_id=${categoryId}`;
  const optionsValuesResponse = await apiClient<OptionValue[]>(
    optionsValuesFetchUrl,
    true,
    {
      method: "GET",
      cache: "no-store",
    },
  );
  if (!optionsValuesResponse.success) {
    log.error("Error fetching options values", {
      context: { optionsValues: optionsValuesResponse.message },
    });
    notFound();
  }
  const optionsValues = optionsValuesResponse.data ?? [];

  return (
    <BrokerOptions
      broker_id={brokerId}
      options={options}
      optionsValues={optionsValues}
      is_admin={is_admin}
      can_edit={can_edit}
      entity_id={brokerId}
      entity_type="broker"
      category={categorySlug.replace("-", " ").toUpperCase()}
    />
  );
}
