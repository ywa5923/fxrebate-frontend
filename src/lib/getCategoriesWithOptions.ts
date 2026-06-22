import { BASE_URL } from "@/constants";
import { OptionCategory } from "@/types";
import logger from "@/lib/logger";

export async function getCategoriesWithOptions(
  locale:string | null = null, 
  broker_type: string | null = null,
  broker_id: number
 
): Promise<OptionCategory[]> {

    const thisLogger = logger.child("lib/getGategoriesWithOptions");
    const url = new URL(`${BASE_URL}/option-categories`);
  
    
    if (broker_id == null || Number.isNaN(broker_id)) {
      throw new Error("Broker ID is required");
    }


    url.searchParams.append("broker_id", broker_id.toString());
   

    if(locale!==null && locale!=='en'){
        url.searchParams.append("language_code", locale);
    }
    if(broker_type){
        url.searchParams.append("broker_type", broker_type);
    }
   
    try {
     
     thisLogger.debug("URL for fetching option categories", {url:url.toString()});
     const response = await fetch(url.toString(), { cache: "no-store" });
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