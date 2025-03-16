import { BASE_URL } from '@/constants';
import { BrokersSearchParams } from '@/types';

export function buildBrokerUrl(locale: string, zone:string,searchParams: BrokersSearchParams) {

     // Initialize the base URL
     let url = `${BASE_URL}/brokers?language[eq]=${locale}&page=1&zone[eq]=${zone}`;

    if(Object.keys(searchParams).length === 0)
        return url;

    // Destructure the parameters with default values
    const {
        columns = '',
        page = 1,
        sortBy = '',
        sortOrder = '',
        filter_offices = '',
        filter_headquarters = '',
        filter_min_deposit = '',
        filter_withdrawal_methods = '',
        filter_group_trading_account_info = '',
        filter_group_fund_managers_features = '',
        filter_group_spread_types = '',
        filter_account_currency = '',
        filter_trading_instruments = '',
        filter_support_options = '',
        filter_regulators = '',
        filter_web = '',
        filter_mobile = '',
    } = searchParams ;

    


    // Append columns filter if specified
    if (columns) {
        url += `&columns[in]=${columns}`;
    }
    // Add sorting if both sortBy and sortOrder are present
    if (sortBy && sortOrder) {
        const sortDirection = sortOrder === 'asc' ? '+' : '-';
        url += `&order_by[eq]=${sortDirection}${sortBy}`;
    }

    // Dynamically add filters if they exist
    const InFilters: Omit<BrokersSearchParams, 'columns' | 'page' | 'sortBy' | 'sortOrder' |'filter_min_deposit'|'country'>= {
        filter_offices,
        filter_headquarters,
        filter_withdrawal_methods,
        filter_group_trading_account_info,
        filter_group_fund_managers_features,
        filter_group_spread_types,
        filter_account_currency,
        filter_trading_instruments,
        filter_support_options,
        filter_regulators,
        filter_web,
        filter_mobile,
    };
    // Loop through filters and append them to the URL
    Object.entries(InFilters).forEach(([key, value]) => {
        if (value) {
            url += `&${key}[in]=${value}`;
        }
    });

    if (filter_min_deposit) {
        url = url + `&filter_min_deposit[lt]=${filter_min_deposit}`;
    }
    //=====TO BE DONE===========
    //COUNTRY SHOULD BE TAKEN FROM IP USING MIDDLEWARE
    url = url + '&country[eq]=ro';
    return url;
}

//backend tested with http://localhost:8000/api/v1/brokers?language[eq]=ro&page=1&columns[in]=trading_name,trading_fees,account_type,jurisdictions,promotion_title,fixed_spreads,support_options&order_by[eq]=+account_type
