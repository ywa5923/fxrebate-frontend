export type Url = {
  id: number;
  urlable_id?: number | null;
  urlable_type?: string | null;
  url_type: string;
  url: string;
  previous_url: string | null;
  is_updated_entry: number; // 1 or 0
  public_url: string | null;
  name: string;
  previous_name: string | null;
  public_name: string | null;
  slug: string;
  is_invariant: boolean;
  category_position?: number | null;
  description?: string | null;
  status?: "published" | "pending" | "rejected";
  status_reason?: string | null;
  option_category_id?: number | null;
  broker_id: number;
  zone_id?: number | null;
  created_at: string;
  updated_at: string;
};

export type UrlPayload = Pick<Url, "broker_id" | "urlable_type" | "url_type"> & {
  id: number | null;
  urlable_id: number | null;
  url?: string;
  name?: string;
};