import { Option, DynamicTableRow } from "@/types";
import { apiClient } from "@/lib/api-client";
import { notFound } from "next/navigation";
import logger from "@/lib/logger";
import Contests from "./Contests";

type Props = {
  brokerId: number;
  is_admin: boolean;
  can_edit: boolean;
  can_manage: boolean;
  contestOptions: Option[];
};

export default async function MyContests({
  brokerId,
  contestOptions,
  is_admin,
  can_edit,
  can_manage,
}: Props) {
  const log = logger.child("MyContests");
  const contestsFetchUrl = `/contests/${brokerId}?language_code=en`;
  const contestsResponse = await apiClient<DynamicTableRow[]>(
    contestsFetchUrl,
    true,
    {
      method: "GET",
      cache: "no-store",
    },
  );
  if (!contestsResponse.success) {
    log.error("Error fetching contests", {
      context: { contests: contestsResponse.message },
    });
    notFound();
  }
  const contests = contestsResponse.data ?? [];

  return (
    <Contests
      broker_id={brokerId}
      contests={contests}
      options={contestOptions}
      is_admin={is_admin}
      can_edit={can_edit}
      can_manage={can_manage}
    />
  );
}
