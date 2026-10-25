import type { RatingReview } from "./RatingReview";

export interface Rating {
  id: number;
  broker_id: number;
  zone_id: number | null;
  rating: number | string | null;
  rating_type: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface BrokerRatingsData {
  ratings: Rating[];
  reviews: RatingReview[];
}
