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
  is_master_link: boolean;
  metadata?: Record<string, any>;
};

export type AffiliateLink = Url & {
  account_type_id?: number | null;
  account_type_name?: string;
  currency?: string | null;
  public_currency?: string | null;
  previous_currency?: string | null;
  type:string;
  platform_urls?: PlatformUrl[];
  metadata?: Record<string, any>;
}

// export type UrlPayload = Pick<Url, "broker_id" | "urlable_type" | "url_type"> & {
//   id: number | null;
//   urlable_id: number | null;
//   url?: string;
//   name?: string;
// };

export type PlatformUrl = {
  id: number;
 name: string;
};

export type FullPlatformUrl = {
  id: number;
  url: string;
  public_url: string;
  name: string;
  public_name: string;
  is_updated_entry: number; // 1 or 0
  is_public: number; // 1 or 0
};

export type AccountWithPlatformLinks = {
  account_type_id: number;
  account_type_name: string;
  platform_urls?: PlatformUrl[];
};

export type AffiliateLinksData={
  account_types: AccountWithPlatformLinks[];
  ib_affiliate_urls?: AffiliateLink[];
  sub_ib_affiliate_urls?: AffiliateLink[];
  currency_list: [{label: string; value: string}];
};



export type AffiliateLinkTabType = "sign-up-ib-affiliate-link" | "sign-up-sub-ib-affiliate-link" | "notes";
