import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import logger from "@/lib/logger";
import { MatrixCell, OptionCategory } from "@/types";
import { MatrixHeaders } from "@/types/Matrix";
import { EmptyStateWithAction } from "@/components/EmptyStateWithAction";
import { notFound } from "next/navigation";
import Rebates from "./Rebates";

type Props = {
  brokerId: number;
  brokerType: string;
  is_admin: boolean;
  can_edit: boolean;
  categoriesWithOptions: OptionCategory[];
};

export default async function MyRebates({
  brokerId,
  brokerType,
  is_admin,
  can_edit,
  categoriesWithOptions,
}: Props) {
  const log = logger.child("MyRebates");
  const headersFetchUrl = `/matrix/headers/${brokerId}?broker_type=${brokerType}&language=en&matrix_id=Matrix-1&broker_id_strict=0`;
  const matrixDataFetchUrl = `/matrix/${brokerId}?matrix_name=Matrix-1`;

  const [headersResponse, matrixDataResponse] = await Promise.all([
    apiClient<MatrixHeaders>(
      headersFetchUrl,
      UseTokenAuth.Yes,
      { method: "GET", cache: "no-store" },
      ErrorMode.Return,
    ),
    apiClient<MatrixCell[][]>(
      matrixDataFetchUrl,
      UseTokenAuth.Yes,
      { method: "GET", cache: "no-store" },
      ErrorMode.Return,
    ),
  ]);
  if (!headersResponse.success || !matrixDataResponse.success) {
    log.error("Error fetching matrix headers or matrix data", {
      context: {
        hedears: headersResponse.message,
        matrixData: matrixDataResponse.message,
      },
    });
    notFound();
  }
  const columnHeaders = headersResponse.data?.columnHeaders ?? [];
  const rowHeaders = headersResponse.data?.rowHeaders ?? [];
  const initialMatrixData = matrixDataResponse.data ?? [];

  if (columnHeaders.length === 0) {
    const tradingAccountCategoryId = categoriesWithOptions.find(
      (category) => category.slug === "my-trading-accounts",
    )?.id;
    if (!tradingAccountCategoryId) {
      log.error("Trading account category not found", {
        context: { categoriesWithOptions: categoriesWithOptions },
      });
      notFound();
    }
    return (
      <EmptyStateWithAction
        messages={{
          title: "No Account Types Found",
          description:
            "You need to create account types before you can configure the rebates matrix.",
          buttonLabel: "Go to Account Types",
        }}
        href={`/en/control-panel/${brokerId}/broker-profile/${tradingAccountCategoryId}/my-trading-accounts`}
      />
    );
  }

  return (
    <>
      <Rebates
        rowHeaders={rowHeaders}
        columnHeaders={columnHeaders}
        initialMatrixData={initialMatrixData}
        is_admin={is_admin}
        can_edit={can_edit}
        brokerId={brokerId}
      />
      {is_admin && (
        <Rebates
          rowHeaders={rowHeaders}
          columnHeaders={columnHeaders}
          initialMatrixData={initialMatrixData}
          is_admin={false}
          can_edit={can_edit}
          brokerId={brokerId}
        />
      )}
    </>
  );
}
