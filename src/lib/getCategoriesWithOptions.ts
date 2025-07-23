import { BASE_URL } from "@/constants";
import { OptionCategory } from "@/types";

export async function getCategoriesWithOptions(
  locale:string | null = null, 
  broker_type: string | null = null,
 
): Promise<OptionCategory[]> {
    const url = new URL(`${BASE_URL}/option-categories`);
  
    // url.searchParams.append("language[eq]", locale);
    // url.searchParams.append("all_columns[eq]", all_columns ? "1" : "0");
    // url.searchParams.append("broker_type[eq]", broker_type);
    
   
    if(locale!==null && locale!=='en'){
        url.searchParams.append("language_code", locale);
    }
    if(broker_type){
        url.searchParams.append("broker_type", broker_type);
    }
   
    try {
      
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