import { Option } from "@/types";
import { apiClient } from "@/lib/api-client";
import { UseTokenAuth } from "@/lib/enums";
import { ErrorMode } from "@/lib/enums";
import { EntityTypeLinks } from "@/types/TypeLinks";
import { DynamicTableRow } from "@/types";
import { notFound } from "next/navigation";
import logger from "@/lib/logger";
import Accounts from "./Accounts";

type Props = {
  brokerId: number;
  accountOptions: Option[];
  is_admin: boolean;
  can_edit: boolean;
  can_manage: boolean;
};

export default async function MyAccountLinks({
  brokerId,
  accountOptions,
  is_admin,
  can_edit,
  can_manage,
}: Props) {
  const thisLogger = logger.child("MyAccountLinksComponent");
  let accountTypesLinksFetchUrl = `/urls/${brokerId}/account-type/all?language_code=en`;
  let accountTypesFetchUrl = `/account-types/${brokerId}?language_code=en`;

  const [accountTypesLinksResponse, accountTypesResponse] = await Promise.all([
    apiClient<EntityTypeLinks>(
      accountTypesLinksFetchUrl,
      UseTokenAuth.Yes,
      { method: "GET", cache: "no-store" },
      ErrorMode.Return,
    ),
    apiClient<DynamicTableRow[]>(
      accountTypesFetchUrl,
      UseTokenAuth.Yes,
      { method: "GET", cache: "no-store" },
      ErrorMode.Return,
    ),
  ]);
  if (!accountTypesLinksResponse.success || !accountTypesResponse.success) {
    thisLogger.error("Error fetching account types links or account types", {
      context: {
        accountTypesLinks: accountTypesLinksResponse.message,
        accountTypes: accountTypesResponse.message,
      },
    });
    notFound();
  }
  const accountTypesLinks = accountTypesLinksResponse.data ?? null;
  const accountTypes = accountTypesResponse.data ?? [];

  return (
    <Accounts
      broker_id={brokerId}
      accounts={accountTypes}
      options={accountOptions}
      is_admin={is_admin}
      can_edit={can_edit}
      can_manage={can_manage}
      linksGroupedByEntityId={
        accountTypesLinks?.links_grouped_by_entity_id ?? {}
      }
      masterLinksGroupedByType={
        accountTypesLinks?.master_links_grouped_by_type ?? {}
      }
      linksGroups={accountTypesLinks?.links_groups ?? []}
      linksOptions={accountTypesLinks?.links_options ?? {}}
    />
  );
}
