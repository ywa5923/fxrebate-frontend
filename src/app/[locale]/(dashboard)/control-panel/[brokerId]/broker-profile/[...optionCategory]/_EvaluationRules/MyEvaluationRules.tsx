import {
  EvaluationFormConfig,
  EvaluationRulesForm,
  type EvaluationRule,
} from "@/components/EvaluationRules";
import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import logger from "@/lib/logger";
import { notFound } from "next/navigation";

type Props = {
  brokerId: number;
  is_admin: boolean;
  can_edit: boolean;
};

export default async function MyEvaluationRules({
  brokerId,
  is_admin,
  can_edit,
}: Props) {
  const log = logger.child("MyEvaluationRules");
  const evaluationRulesFormConfigUrl = "/evaluation-rules/form-config";
  const evaluationRulesListUrl = `/evaluation-rules/${brokerId}`;

  const [evaluationRulesFormConfigResponse, evaluationRulesListResponse] =
    await Promise.all([
      apiClient<EvaluationFormConfig>(
        evaluationRulesFormConfigUrl,
        UseTokenAuth.Yes,
        { method: "GET", cache: "no-store" },
        ErrorMode.Return,
      ),
      apiClient<EvaluationRule[]>(
        evaluationRulesListUrl,
        UseTokenAuth.Yes,
        { method: "GET", cache: "no-store" },
        ErrorMode.Return,
      ),
    ]);

  if (
    !evaluationRulesFormConfigResponse.success ||
    !evaluationRulesFormConfigResponse.data
  ) {
    log.error("Error fetching evaluation rules form config", {
      context: { evaluationRules: evaluationRulesFormConfigResponse.message },
    });
    notFound();
  }

  const evaluationRulesFormConfig = evaluationRulesFormConfigResponse.data;
  const evaluationRules = evaluationRulesListResponse.success
    ? (evaluationRulesListResponse.data ?? [])
    : [];

  return (
    <EvaluationRulesForm
      key={brokerId}
      is_admin={is_admin}
      can_edit={can_edit}
      formConfig={evaluationRulesFormConfig}
      brokerId={brokerId}
      evaluationRules={evaluationRules}
    />
  );
}
