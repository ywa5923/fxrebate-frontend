"use client";

import { useEffect, useRef } from "react";
import { CircleCheck } from "lucide-react";
import { useTranslation } from "@/providers/translations";

export default function BrokerRebateSuccess() {
  const { t } = useTranslation();
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageRef.current?.focus();
  }, []);

  return (
    <div
      ref={messageRef}
      role="status"
      tabIndex={-1}
      className="flex min-h-64 w-full min-w-0 flex-col items-center justify-center gap-5 rounded-[11px] border border-[#dce5df] bg-[#f5f8f6] px-6 py-12 text-center text-[#3e5a4b] outline-none dark:border-[#34473c] dark:bg-[#1c2621] dark:text-[#becfc4] sm:px-8"
    >
      <CircleCheck
        className="h-12 w-12 shrink-0 text-[#668574] dark:text-[#86a492]"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <p className="max-w-xl text-lg font-semibold leading-relaxed [overflow-wrap:anywhere] sm:text-xl">
        {t("setup_submit_confirmation")}
      </p>
    </div>
  );
}
