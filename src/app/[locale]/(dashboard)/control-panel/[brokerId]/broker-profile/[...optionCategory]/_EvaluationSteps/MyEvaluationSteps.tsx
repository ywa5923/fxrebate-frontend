import { DynamicTableRow, EntityTypeLinks } from "@/types";
import { apiClient } from "@/lib/api-client";
import { UseTokenAuth } from "@/lib/enums";
import { ErrorMode } from "@/lib/enums";
import { Option } from "@/types";
import { notFound } from "next/navigation";
import logger from "@/lib/logger";
import EvaluationSteps from "./EvaluationSteps";

type Props = {
    brokerId: number;
    evaluationOptions: Option[];
    is_admin: boolean;
}
export default async function MyEvaluationSteps({ brokerId, evaluationOptions, is_admin }: Props) {
    let linksUrl = `/urls/${brokerId}/evaluation-step/all?language_code=en`;
    const thisLogger = logger.child("MyEvaluationStepsComponent");
    const evaluationStepsUrl = `/evaluation-steps/${brokerId}`;
    const [linksResponse, evaluationStepsResponse] = await Promise.all(
      [
        apiClient<EntityTypeLinks>(
          linksUrl,
          UseTokenAuth.Yes,
          { method: "GET", cache: "no-store" },
          ErrorMode.Return,
        ),
        apiClient<DynamicTableRow[]>(
          evaluationStepsUrl,
          UseTokenAuth.Yes,
          { method: "GET", cache: "no-store" },
          ErrorMode.Return,
        ),
      ],
    );
    if (!linksResponse.success || !evaluationStepsResponse.success) {
      thisLogger.error("Error fetching links or evaluation steps", {
        context: {
          links: linksResponse.message,
          evaluationSteps: evaluationStepsResponse.message,
        },
      });
      notFound();
    }
    const links = linksResponse.data ?? null;
    const evaluationSteps = evaluationStepsResponse.data ?? [];

    return (
      <EvaluationSteps
        broker_id={brokerId}
        evaluationSteps={evaluationSteps}
        options={evaluationOptions}
        is_admin={is_admin}
        linksGroupedByEvaluationStepId={
            links?.links_grouped_by_entity_id ?? {}
          }
          masterLinksGroupedByType={
            links?.master_links_grouped_by_type ?? {}
          }
          linksGroups={links?.links_groups ?? []}
          linksOptions={links?.links_options ?? {}}
      />
    );
}