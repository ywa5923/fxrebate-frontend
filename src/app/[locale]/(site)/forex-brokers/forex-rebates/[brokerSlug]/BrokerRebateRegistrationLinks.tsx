import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SetupRegistrationLink } from "./setupFormData";
import { useTranslation } from "@/providers/translations";

type Props = { links: SetupRegistrationLink[] };

export default function BrokerRebateRegistrationLinks({ links }: Props) {
  const { t } = useTranslation();
  if (links.length === 0) return <p role="status" className="text-sm">{t("setup_registration_unavailable")}</p>;

  return (
    <div className="flex flex-col divide-y divide-[#0c110f]/15 dark:divide-white/15">
      {links.map((link, index) => (
        <div
          key={`${link.url}-${index}`}
          className="grid min-w-0 gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_230px] sm:items-center sm:gap-6"
        >
          <h2 className="min-w-0 text-base font-semibold leading-snug [overflow-wrap:anywhere] sm:text-lg">
            {link.name}
          </h2>
          <Button asChild className="flex h-auto min-h-11 w-full min-w-0 shrink-0 items-center justify-between gap-3 whitespace-normal rounded-lg border border-[#1d885b] bg-gradient-to-r from-[rgba(0,106,61,0.8)] to-[rgba(0,66,23,0.8)] pl-4 pr-2 text-left text-sm font-medium text-white hover:brightness-110 sm:text-base">
            <a href={link.url} target="_blank" rel="noopener noreferrer" aria-label={`${t("setup_open_account")}: ${link.name}`}>
              <span className="min-w-0 [overflow-wrap:anywhere]">{t("setup_open_account")}</span>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-[5px] bg-[#1d885b]">
                <ChevronRight className="size-4" aria-hidden />
              </span>
            </a>
          </Button>
        </div>
      ))}
    </div>
  );
}
