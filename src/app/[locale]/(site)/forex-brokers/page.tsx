"use client";

import { useTranslation } from "@/providers/translations";

export default function ForexBrokersPage() {
  const { t } = useTranslation("navbar");

  return (
    <div>
      <h1>{t("forex_brokers")}</h1>
    </div>
  )
}
