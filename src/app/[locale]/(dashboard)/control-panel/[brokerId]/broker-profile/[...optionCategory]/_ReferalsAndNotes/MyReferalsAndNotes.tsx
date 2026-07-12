import { apiClient } from "@/lib/api-client";
import { Option, OptionValue } from "@/types";
import { notFound } from "next/navigation";
import logger from "@/lib/logger";
import { UseTokenAuth } from "@/lib/enums";

import { AffiliateLinksData } from "@/types/Url";
import ReferalLinksAndNotes from "./ReferalLinksAndNotes";
type Props = {
    brokerId: number;
    notesOptions: Option[];
    optionCategoryId: string;
    is_admin: boolean;
}
export default async function MyReferalsAndNotes({ brokerId, notesOptions, optionCategoryId, is_admin }: Props) {
    const thisLogger = logger.child("MyReferalsAndNotesComponent");
    let optionsValuesFetchUrl = `/option-values/${brokerId}?entity_type=Broker&language_code=en&category_id=${optionCategoryId}`;
    let notesOptionsValuesResponse = await apiClient<OptionValue[]>(
      optionsValuesFetchUrl,
      true,
      {
        method: "GET",
        cache: "no-store",
      },
    );
    if (!notesOptionsValuesResponse.success) {
      thisLogger.error("Error fetching notes options values", {
        context: { notesOptionsValues: notesOptionsValuesResponse.message },
      });
      notFound();
    }
    let notesOptionsValues = notesOptionsValuesResponse.data ?? [];

    let referralLinksFetchUrl = `/urls/broker/${brokerId}/affiliate-links`;
    let referralLinksResponse = await apiClient<AffiliateLinksData>(
      referralLinksFetchUrl,
      UseTokenAuth.No,
      {
        method: "GET",
        cache: "no-store",
      },
    );
    if (!referralLinksResponse.success) {
      thisLogger.error("Error fetching referral links", {
        context: { referralLinks: referralLinksResponse.message },
      });
      notFound();
    }
    if (!referralLinksResponse.data?.account_types) {
      thisLogger.error("No account types found", {
        context: { referralLinks: referralLinksResponse.message },
      });
      throw new Error("No account types found");
    }

    return (
      <ReferalLinksAndNotes
        is_admin={is_admin}
        brokerId={brokerId}
        accountTypes={referralLinksResponse.data?.account_types ?? []}
        currencyList={referralLinksResponse.data.currency_list}
        IBLinks={referralLinksResponse.data?.ib_affiliate_urls ?? []}
        SubIBLinks={referralLinksResponse.data?.sub_ib_affiliate_urls ?? []}
        notesOptions={notesOptions}
        notesOptionsValues={notesOptionsValues}
      />
    );
}