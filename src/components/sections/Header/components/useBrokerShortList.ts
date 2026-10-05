"use client";

import { useRef, useState } from "react";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { UseTokenAuth } from "@/lib/enums";
import logger from "@/lib/logger";

const brokersSchema = z.array(z.object({
  id: z.number().int().positive(),
  trading_name: z.string().trim().min(1),
  logo: z.string().nullish(),
}));

export type MenuBroker = z.infer<typeof brokersSchema>[number];
export type BrokerShortList = ReturnType<typeof useBrokerShortList>;

export function useBrokerShortList() {
  const [brokers, setBrokers] = useState<MenuBroker[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const loading = useRef(false);
  const loaded = useRef(false);

  async function load() {
    if (loading.current || loaded.current) return;
    loading.current = true;
    setStatus("loading");

    try {
      const response = await apiClient<unknown>(
        "/site/brokers/broker/short-list",
        UseTokenAuth.No,
        { method: "GET", next: { revalidate: 60, tags: ["brokers-short-list"] } },
      );
      if (!response.success) throw new Error(response.message ?? "Broker list request failed");
      const data = brokersSchema.parse(response.data);
      setBrokers(data);
      loaded.current = true;
      setStatus("success");
    } catch (error) {
      logger.child("Header/ForexBrokersMenu").error("Could not load the broker short list", {
        error,
        page: window.location.pathname,
      });
      setStatus("error");
    } finally {
      loading.current = false;
    }
  }

  return { brokers, status, load };
}
