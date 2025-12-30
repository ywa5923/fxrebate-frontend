
export interface Broker {
  id: number;
  broker_type: string;
  country_id: number | null;
  zone_id: number | null;
  country_code: string | null;
  zone_code: string | null;
  logo: string;
  trading_name: string;
  home_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}




// export interface BrokerType {
//   id: number;
//   name: string;
// }

// export interface CountryOption {
//   id: number;
//   name: string;
// }

// export interface BrokerMetaDataResponse {
//   success: boolean;
//   message?: string;
//   countries: CountryOption[];
//   brokerTypes: BrokerType[];
// }

// export interface RegisterBrokerData {
//   broker_type_id: number;
//   email: string;
//   trading_name: string;
//   country_id: number;
// }

// export interface RegisterBrokerResponse {
//   success: boolean;
//   message?: string;
//   data?: any;
// }


