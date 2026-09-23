import logger from "@/lib/logger";
import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import type { HighestRebateBroker } from "@/types";
import { brokerMatchesSlug, type SiteBrokerType } from "./data";

const log = logger.child(
  "site/forex-brokers/forex-rebates/fetchBrokerBySlug",
);

function brokerMatchesRequest(
  broker: HighestRebateBroker,
  brokerSlug: string,
  brokerId: number | null,
): boolean {
  if (!broker || typeof broker.trading_name !== "string" || !broker.trading_name.trim()) {
    return false;
  }
  if (brokerId !== null && broker.broker_id === brokerId) {
    return true;
  }
  return brokerMatchesSlug(broker, brokerSlug);
}

export async function fetchBrokerBySlug({
  locale,
  zone,
  brokerType,
  brokerSlug,
  brokerId = null,
}: {
  locale: string;
  zone: string | null;
  brokerType: SiteBrokerType;
  brokerSlug: string;
  brokerId?: number | null;
}): Promise<HighestRebateBroker | null> {
  let page = 1;
  let lastPage = 1;

  do {
    const query = new URLSearchParams({
      language_code: locale,
      page: String(page),
      per_page: "50",
      broker_type: brokerType,
    });
    if (zone) {
      query.set("zone_code", zone);
    }

    const url = `/site/highest-rebates?${query.toString()}`;
    log.debug("Fetching highest rebates page for broker slug", {
      url,
      brokerSlug,
    });

    const response = await apiClient<HighestRebateBroker[]>(
      url,
      UseTokenAuth.No,
      {
        method: "GET",
        next: {
          revalidate: 60,
          tags: [
            "highest-rebates",
            `highest-rebates:${brokerType}`,
            `highest-rebates:${brokerType}:${brokerSlug}`,
          ],
        },
      },
      ErrorMode.Return,
    );

    if (!response.success || !response.data) {
      log.error("Error fetching highest rebates for broker slug", {
        url,
        brokerSlug,
        message: response.message,
        status: response.status,
      });
      return null;
    }

    const match = response.data.find((broker) =>
      brokerMatchesRequest(broker, brokerSlug, brokerId),
    );
    if (match) {
      return match;
    }

    lastPage = response.pagination?.last_page ?? 1;
    page += 1;
  } while (page <= lastPage);

  return null;
}
