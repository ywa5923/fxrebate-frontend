import { BASE_URL } from "@/constants";
import { OptionCategory } from "@/types";
import logger from "@/lib/logger";
import { getBearerToken } from "./auth-actions";

export async function getCategoriesWithOptions(
  locale:string | null = null, 
  broker_type: string | null = null,
  broker_id: number
 
): Promise<OptionCategory[]> {

    const thisLogger = logger.child("lib/getGategoriesWithOptions");
   
  
    
    if (broker_id == null || Number.isNaN(broker_id)) {
      throw new Error("Broker ID is required");
    }


    const url = new URL(`${BASE_URL}/option-categories/${broker_id}`);
   

    if(locale!==null && locale!=='en'){
        url.searchParams.append("language_code", locale);
    }
    if(broker_type){
        url.searchParams.append("broker_type", broker_type);
    }
   
    try {
     const token = await getBearerToken();
     const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
     thisLogger.debug("URL for fetching option categories", {url:url.toString()});
     const response = await fetch(url.toString(), { cache: "no-store", headers });
     //link example:http://localhost:8080/api/v1/broker_options?language[eq]=en&all_columns[eq]=1&broker_type[eq]=brokers"
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const responseData = await response.json()
      
      return responseData.data as OptionCategory[];
    } catch (error) {
      console.error('Error fetching broker options:', error)
      throw error
    }
  }