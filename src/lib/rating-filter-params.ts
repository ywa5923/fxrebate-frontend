// These API parameters must be normalized before the first request, when the
// backend's filters_config is not available yet. Client code also supplies any
// additional rating-group parameters from that configuration.
const RATING_QUERY_PARAMS = [
  "filter_overall_rating",
  "filter_user_rating",
  "filter_popularity",
  "filter_client_popularity",
  "filter_regulator_rating",
  "filter_pricing_rating",
  "filter_customer_support_rating",
  "filter_features_rating",
] as const;

export function normalizeRatingFilterParams(
  params: URLSearchParams,
  configuredRatingParams: readonly string[] = [],
): boolean {
  let changed = false;
  for (const key of new Set([...RATING_QUERY_PARAMS, ...configuredRatingParams])) {
    const values = params.getAll(key);
    if (values.length === 0) continue;

    // Keep the first selection from legacy comma lists or repeated parameters.
    const selected = values.flatMap((value) => value.split(","))
      .map((value) => value.trim()).find((value) => value !== "");
    if (selected === undefined) {
      params.delete(key);
      changed = true;
    } else if (values.length !== 1 || values[0] !== selected) {
      params.set(key, selected);
      changed = true;
    }
  }
  return changed;
}
