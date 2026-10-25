import {
  Award,
  Coins,
  Headphones,
  MessageSquare,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  TrendingUp,
  UserRound,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BrokerRatingsData, Rating } from "@/types";

const ratingCategories = [
  { type: "overall", label: "Overall Rating", icon: Award },
  { type: "user", label: "User Rating", icon: UserRound },
  { type: "popularity", label: "Popularity Rating", icon: TrendingUp },
  { type: "regulatory", label: "Regulatory Rating", icon: ShieldCheck },
  { type: "pricing", label: "Pricing Rating", icon: Coins },
  { type: "customer_support", label: "Customer Support Rating", icon: Headphones },
  { type: "features", label: "Features Rating", icon: SlidersHorizontal },
];

function normalizeRatingType(type: string) {
  const normalized = type.trim().toLowerCase().replace(/[\s-]+/g, "_").replace(/_rating$/, "");
  return normalized === "support" ? "customer_support" : normalized;
}

function ratingTypeLabel(type: string) {
  return ratingCategories.find((category) => category.type === normalizeRatingType(type))?.label ?? type;
}

function RatingValue({ value, locale }: { value: Rating["rating"] | undefined; locale: string }) {
  const score = typeof value === "string" && value.trim() !== ""
    ? Number(value)
    : value;

  if (typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 5) {
    return <span className="text-sm text-gray-500 dark:text-gray-400">Not defined</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span className="flex shrink-0 gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className="relative block size-4">
            <Star className="size-4 fill-gray-100 text-gray-300 dark:fill-gray-800 dark:text-gray-600" />
            <span
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${Math.max(0, Math.min(1, score - index)) * 100}%` }}
            >
              <Star className="size-4 max-w-none fill-yellow-400 text-yellow-500" />
            </span>
          </span>
        ))}
      </span>
      <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">
        {new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(score)}
        <span className="ml-1 font-normal text-gray-500 dark:text-gray-400">/ 5</span>
      </span>
    </div>
  );
}

function RatingDate({ value, formatter }: { value: string | null | undefined; formatter: Intl.DateTimeFormat }) {
  const date = value ? new Date(value) : null;
  if (!date || !Number.isFinite(date.getTime())) {
    return <span>Not defined</span>;
  }

  return <time dateTime={date.toISOString()}>{formatter.format(date)}</time>;
}

export default function BrokerRatingsContent({ ratings, reviews, locale }: BrokerRatingsData & { locale: string }) {
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });

  return (
    <>
      <Table aria-label="Broker ratings" className="table-fixed">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead scope="col" className="w-1/2 py-3 pr-3 md:w-[30%]">Rating Type</TableHead>
            <TableHead scope="col" className="w-1/2 py-3 md:w-[30%]">Rating Value</TableHead>
            <TableHead scope="col" className="hidden w-1/5 py-3 md:table-cell">Created</TableHead>
            <TableHead scope="col" className="hidden w-1/5 py-3 md:table-cell">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ratingCategories.flatMap((category) => {
            const matches = ratings.filter((rating) => normalizeRatingType(rating.rating_type) === category.type);
            const rows: (Rating | undefined)[] = matches.length > 0 ? matches : [undefined];

            return rows.map((rating) => (
              <TableRow key={`${category.type}-${rating?.id ?? "undefined"}`}>
                <TableHead scope="row" className="py-4 pr-3 font-medium text-gray-900 dark:text-gray-100">
                  <div className="flex items-start gap-2.5">
                    <category.icon className="mt-0.5 hidden size-4 shrink-0 text-gray-400 sm:block" aria-hidden="true" />
                    <div className="min-w-0">
                      <span>{category.label}</span>
                      {rating?.zone_id != null && (
                        <span className="mt-1 block text-xs font-normal text-gray-500 dark:text-gray-400">
                          Zone #{rating.zone_id}
                        </span>
                      )}
                    </div>
                  </div>
                </TableHead>
                <TableCell className="py-4">
                  <RatingValue value={rating?.rating} locale={locale} />
                  {rating && (
                    <dl className="mt-3 space-y-1.5 text-xs text-gray-500 dark:text-gray-400 md:hidden">
                      <div>
                        <dt className="font-medium">Created</dt>
                        <dd><RatingDate value={rating.created_at} formatter={dateFormatter} /></dd>
                      </div>
                      <div>
                        <dt className="font-medium">Updated</dt>
                        <dd><RatingDate value={rating.updated_at} formatter={dateFormatter} /></dd>
                      </div>
                    </dl>
                  )}
                </TableCell>
                <TableCell className="hidden py-4 text-xs text-gray-500 dark:text-gray-400 md:table-cell">
                  <RatingDate value={rating?.created_at} formatter={dateFormatter} />
                </TableCell>
                <TableCell className="hidden py-4 text-xs text-gray-500 dark:text-gray-400 md:table-cell">
                  <RatingDate value={rating?.updated_at} formatter={dateFormatter} />
                </TableCell>
              </TableRow>
            ));
          })}
        </TableBody>
      </Table>

      <section aria-labelledby="broker-reviews-heading" className="mt-10">
        <div className="flex items-center gap-2.5 border-b border-gray-200 pb-4 dark:border-gray-800">
          <MessageSquare className="size-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
          <h2 id="broker-reviews-heading" className="text-lg font-semibold text-gray-900 dark:text-gray-100">Reviews</h2>
          <span className="text-sm tabular-nums text-gray-500 dark:text-gray-400">({reviews.length})</span>
        </div>

        {reviews.length === 0 ? (
          <p className="py-8 text-sm text-gray-500 dark:text-gray-400">No reviews yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {reviews.map((review) => (
              <li key={review.id} className="py-6">
                <article>
                  <header className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 basis-48">
                      <h3 className="text-sm font-semibold text-gray-900 [overflow-wrap:anywhere] dark:text-gray-100">
                        {review.name?.trim() || "Anonymous"}
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{ratingTypeLabel(review.rating_type)}</span>
                        {review.zone_id != null && <span>Zone #{review.zone_id}</span>}
                      </div>
                    </div>
                    <RatingValue value={review.rating} locale={locale} />
                  </header>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 [overflow-wrap:anywhere] dark:text-gray-300">
                    {review.review?.trim() || "Not defined"}
                  </p>
                  <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex flex-wrap gap-x-1.5">
                      <dt className="font-medium">Created:</dt>
                      <dd><RatingDate value={review.created_at} formatter={dateFormatter} /></dd>
                    </div>
                    <div className="flex flex-wrap gap-x-1.5">
                      <dt className="font-medium">Updated:</dt>
                      <dd><RatingDate value={review.updated_at} formatter={dateFormatter} /></dd>
                    </div>
                  </dl>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
