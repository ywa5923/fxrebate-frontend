"use client";

import { useTranslation } from "@/providers/translations";
import BrokerRebateNotes from "./BrokerRebateNotes";
import BrokerRebateRegistrationLinks from "./BrokerRebateRegistrationLinks";
import type { SetupRegistrationLink } from "./setupFormData";
import { t } from "./translations";

type Props = { links: SetupRegistrationLink[]; notes: string[] };

export default function BrokerRebatePartner({ links, notes }: Props) {
  const translations = useTranslation();

  return (
    <div className="flex flex-col gap-4 sm:gap-12">
      <BrokerRebateNotes notes={notes} className="max-w-[1119px] text-sm leading-normal" />
      <div className="rounded-[11px] bg-[#f3f3f3] px-6 py-8 dark:bg-[#171f1c] sm:p-8">
        <BrokerRebateRegistrationLinks
          links={links}
          buttonLabel={t(translations, "setup_open_account")}
          emptyLabel={t(translations, "setup_registration_unavailable")}
        />
      </div>
    </div>
  );
}
