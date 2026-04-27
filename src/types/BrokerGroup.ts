
export interface BrokerGroup {
  id: number;
  name: string;
  description?: string;
  brokers:[{label: string; value: number|string }];
  created_at: string;
  updated_at: string;
}