import { BASE_URL } from "@/constants";
import { BrokerOptionCategory } from "@/types";

export async function getBrokerOptions<T=BrokerOptionCategory[]>(
  locale: string = "en", 
  broker_type: string = "brokers",  
  all_columns: boolean = true,
  zone_code: string | null = null
): Promise<T> {
    const url = new URL(`${BASE_URL}/broker_options`);
  
    url.searchParams.append("language[eq]", locale);
    url.searchParams.append("all_columns[eq]", all_columns ? "1" : "0");
    url.searchParams.append("broker_type[eq]", broker_type);
    
    if (zone_code) {
        url.searchParams.append("zone_code[eq]", zone_code);
    }
   
    try {
        const response = await fetch(url.toString(), { cache: "no-store" });
        //link example:http://localhost:8080/api/v1/broker_options?language[eq]=en&all_columns[eq]=1&broker_type[eq]=brokers"
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const responseData = await response.json()
      
      return responseData.data as T;
    } catch (error) {
      console.error('Error fetching broker options:', error)
      throw error
    }
  }