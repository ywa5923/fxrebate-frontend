import type { Rating } from "./Rating";

export interface RatingReview extends Rating {
  name: string | null;
  review: string | null;
}
