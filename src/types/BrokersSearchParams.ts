export interface BrokersSearchParams {
    zone?:string;
    columns?: string;
    page?: number;
    sortBy?: string;
    sortOrder?: string;
    filter_offices?: string;
    filter_headquarters?: string;
    filter_min_deposit?: string;
    filter_withdrawal_methods?: string;
    filter_group_trading_account_info?: string;
    filter_group_fund_managers_features?: string;
    filter_group_spread_types?: string;
    filter_account_currency?: string;
    filter_trading_instruments?: string;
    filter_support_options?: string;
    filter_regulators?: string;
    filter_web?: string;
    filter_mobile?: string;
  }