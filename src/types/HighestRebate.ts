export type HighestRebateEntry = {
  id: number;
  account_type_id: number;
  account_type_name: string;
  public_value: string | null;
  use_for_promo: boolean;
  zone_id: number | null;
};

/** One broker row from GET /site/highest-rebates */
export type HighestRebateBroker = {
  broker_id: number;
  trading_name: string;
  logo: string | null;
  payment_options: string | null;
  rebates: HighestRebateEntry[];
};
