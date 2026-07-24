import { Option, DynamicTableRow } from "@/types";
import { apiClient } from "@/lib/api-client";
import { notFound } from "next/navigation";
import logger from "@/lib/logger";
import Promotions from "./Promotions";

type Props = {
  brokerId: number;
  is_admin: boolean;
  can_edit: boolean;
  can_manage: boolean;
  promotionOptions: Option[];
};

export default async function MyPromotions({
  brokerId,
  promotionOptions,
  is_admin,
  can_edit,
  can_manage,
}: Props) {
  const log = logger.child("MyPromotions");
  const promotionFetchUrl = `/promotions/${brokerId}?language_code=en`;
  const promotionsResponse = await apiClient<DynamicTableRow[]>(
    promotionFetchUrl,
    true,
    {
      method: "GET",
      cache: "no-store",
    },
  );
  if (!promotionsResponse.success) {
    log.error("Error fetching promotions", {
      context: { promotions: promotionsResponse.message },
    });
    notFound();
  }
  const promotions = promotionsResponse.data ?? [];

  return (
    <Promotions
      broker_id={brokerId}
      promotions={promotions}
      options={promotionOptions}
      is_admin={is_admin}
      can_edit={can_edit}
      can_manage={can_manage}
    />
  );
}
