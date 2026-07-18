import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import logger from "@/lib/logger";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import {
  ColumnHeader,
  RowHeader,
  StaticMatrixData,
  MatrixHeaders,
} from "@/types/Matrix";
import {
  ChallengeMatrixExtraData,
  ChalengeData,
  ChallengePlaceholders,
} from "@/types";
import { createEmptyMatrix } from "@/components/ChallengeMatrix/createEmptyMatrix";

const log = logger.child("components/ChallengeMatrix/loadMatrixData");

const isValueEmpty = (value: string | null | undefined): boolean => {
  if (value == null) return true;
  return String(value).trim() === "";
};

export interface LoadMatrixDataParams {
  brokerId?: number;
  categoryId: number;
  stepId: number;
  stepSlug: string;
  amountId: number | null;
  zoneId: string | null;
  language: string;
  type: "challenge" | "placeholder";
  is_admin: boolean;
}

export type LoadMatrixDataResult =
  | { success: false }
  | {
      success: true;
      columnHeaders: ColumnHeader[];
      rowHeaders: RowHeader[];
      matrixData: StaticMatrixData;
      isEmptyMatrix: boolean;
      matrixExtraData: ChallengeMatrixExtraData;
      isPublished: boolean;
      isPlaceholder: boolean;
    };

/**
 * Fetches the matrix headers and challenge data in parallel and transforms them
 * into the shape the matrix UI consumes. Error toasts are handled here; the
 * caller only needs to apply the returned data to state.
 */
export async function loadMatrixData({
  brokerId,
  categoryId,
  stepId,
  stepSlug,
  amountId,
  zoneId,
  language,
  type,
  is_admin,
}: LoadMatrixDataParams): Promise<LoadMatrixDataResult> {
  const headersUrl = `/challenges/matrix/headers?language=${language}&col_group=${stepSlug}&row_group=challenge`;

  const params = new URLSearchParams({
    category_id: categoryId.toString(),
    step_id: stepId.toString(),
    language,
    ...(amountId ? { amount_id: amountId.toString() } : {}),
    ...(zoneId !== null && zoneId !== undefined
      ? { zone_id: zoneId.toString() }
      : {}),
  });

  const challengeUrl =
    type === "placeholder"
      ? "/challenges/placeholders"
      : `/challenges/${brokerId}`;

  // Fetch headers and challenge data in parallel
  const [headearsResponse, challengeResponse] = await Promise.all([
    apiClient<MatrixHeaders>(
      headersUrl,
      UseTokenAuth.Yes,
      {
        method: "GET",
      },
      ErrorMode.Return,
    ),
    apiClient<ChalengeData & ChallengePlaceholders>(
      `${challengeUrl}?${params.toString()}`,
      true,
      {
        method: "GET",
      },
    ),
  ]);

  // Show detailed API errors only outside production
  const isProd = process.env.NODE_ENV === "production";

  if (!headearsResponse.success || !headearsResponse.data) {
    toast.error(isProd ? "Failed to load matrix" : headearsResponse.message);
    return { success: false };
  }

  if (!challengeResponse.success) {
    toast.error(
      isProd ? "Failed to load matrix data" : challengeResponse.message,
    );
    return { success: false };
  }

  if (!challengeResponse.data) {
    toast.error("Failed to load matrix data" + "No data received");
    return { success: false };
  }

  const { columnHeaders, rowHeaders } = headearsResponse.data;

  log.debug("Data received:", {
    url: `/challenges?${params.toString()}`,
    data: challengeResponse.data,
    json: JSON.stringify(challengeResponse.data, null, 2),
  });

  let {
    matrix: initialData,
    is_published,
    affiliate_master_link,
    affiliate_link,
    evaluation_cost_discount,
    matrix_placeholders_array,
    affiliate_master_link_placeholder,
    affiliate_link_placeholder,
    evaluation_cost_discount_placeholder,
  } = challengeResponse.data;

  const isPlaceholder = type === "placeholder" || false;

  if (is_admin && type === "challenge") {
    if (
      isValueEmpty(affiliate_link?.public_url) &&
      !isValueEmpty(affiliate_link?.url)
    ) {
      affiliate_link.public_url = affiliate_link.url;
      affiliate_link.has_copied_public_value = true;
    }
    if (
      isValueEmpty(evaluation_cost_discount?.public_value) &&
      !isValueEmpty(evaluation_cost_discount?.value)
    ) {
      evaluation_cost_discount.public_value = evaluation_cost_discount.value;
      evaluation_cost_discount.has_copied_public_value = true;
    }
    if (
      isValueEmpty(affiliate_master_link?.public_url) &&
      !isValueEmpty(affiliate_master_link?.url)
    ) {
      affiliate_master_link.public_url = affiliate_master_link.url;
      affiliate_master_link.has_copied_public_value = true;
    }
  }

  // for user and in placeholder mode, the data is the same as received from the API
  const matrixExtraData: ChallengeMatrixExtraData = {
    affiliate_link: {
      ...affiliate_link,
      placeholder: affiliate_link_placeholder,
    },
    evaluation_cost_discount: {
      ...evaluation_cost_discount,
      placeholder: evaluation_cost_discount_placeholder,
    },
    affiliate_master_link: {
      ...affiliate_master_link,
      placeholder: affiliate_master_link_placeholder,
    },
  };

  let matrixData: StaticMatrixData;
  let isEmptyMatrix: boolean;

  if (initialData && Object.keys(initialData).length > 0) {
    if (type === "challenge") {
      matrixData = initialData.map((row) =>
        row.map((cell) => {
          const hasPublicValue = !isValueEmpty(cell.public_value);
          const hasValue = !isValueEmpty(cell.value);

          if (is_admin && !hasPublicValue && hasValue) {
            cell.public_value = cell.value;
            cell.has_copied_public_value = true;
          }

          return {
            ...cell,
            placeholder:
              matrix_placeholders_array?.[
                `${cell.row_slug}-${cell.col_slug}`
              ] ?? null,
          };
        }),
      );
      isEmptyMatrix = false;
    } else {
      matrixData = initialData;
      isEmptyMatrix = false;
    }
  } else {
    matrixData = createEmptyMatrix({
      rowHeaders,
      columnHeaders,
      type,
      matrixPlaceholdersArray: matrix_placeholders_array,
    });
    isEmptyMatrix = true;
  }

  return {
    success: true,
    columnHeaders,
    rowHeaders,
    matrixData,
    isEmptyMatrix,
    matrixExtraData,
    isPublished: is_published,
    isPlaceholder,
  };
}
