export interface BrokerType {
  id: number;
  name: string;
}

export interface CountryOption {
  id: number;
  name: string;
}

export interface BrokerMetaDataResponse {
  success: boolean;
  message?: string;
  countries: CountryOption[];
  brokerTypes: BrokerType[];
}

export interface RegisterBrokerData {
  broker_type_id: number;
  email: string;
  trading_name: string;
  country_id: number;
}

export interface RegisterBrokerResponse {
  success: boolean;
  message?: string;
  data?: any;
}


