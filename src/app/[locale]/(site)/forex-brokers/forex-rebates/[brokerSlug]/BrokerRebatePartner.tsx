"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation, type Translations } from "@/providers/translations";
import { t } from "./translations";

type Props = { registrationUrl?: string };

export default function BrokerRebatePartner({ registrationUrl }: Props) {
  const translations = useTranslation() as Translations;
  const buttonClassName =
    "flex h-12 w-full shrink-0 items-center justify-between rounded-lg border border-[#1d885b] bg-gradient-to-r from-[rgba(0,106,61,0.8)] to-[rgba(0,66,23,0.8)] pl-6 pr-2 text-left text-base font-medium text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-100 sm:w-[255px]";
  const buttonContent = (
    <>
      {t(translations, "setup_open_account")}
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[5px] bg-[#1d885b]">
        <ChevronRight className="size-5" aria-hidden />
      </span>
    </>
  );

  return (
    <div className="flex flex-col gap-4 sm:gap-12">
      <div className="max-w-[1119px] text-sm leading-normal">
        <p>
          {t(translations, "setup_partner_intro_before_email")}{" "}
          <a className="underline underline-offset-2" href="mailto:info@4xc.com">info@4xc.com</a>{" "}
          {t(translations, "setup_partner_intro_after_email")}
        </p>
        <div className="mt-4">
          <p className="font-bold">{t(translations, "setup_partner_email_greeting")}</p>
          <p>{t(translations, "setup_partner_email_body")}</p>
          <p>{t(translations, "setup_partner_email_signoff")}<br />{t(translations, "setup_partner_email_name")}</p>
        </div>
      </div>

      <div className="rounded-[11px] bg-[#f3f3f3] px-6 py-8 dark:bg-[#171f1c] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <h2 className="text-[28px] font-bold leading-[1.11] sm:text-[32px]">
            {t(translations, "setup_partner_open_account_title")}
          </h2>
          {registrationUrl ? (
            <Button asChild className={buttonClassName}>
              <a href={registrationUrl} target="_blank" rel="noopener noreferrer">
                {buttonContent}
              </a>
            </Button>
          ) : (
            <Button type="button" disabled className={buttonClassName} title={t(translations, "setup_registration_unavailable")}>
              {buttonContent}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
