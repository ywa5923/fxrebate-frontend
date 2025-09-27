import { BASE_URL } from "@/constants"
import { MatrixHeaders } from "@/types/Matrix"
import { type } from "os"

export async function getChallengeHeaders(
    language:string,
    col_group: string, 
    row_group: string,
   ) :Promise<MatrixHeaders> {
      const url =new URL(BASE_URL+"/matrix/headers")
        url.searchParams.set("language[eq]", language)
      url.searchParams.set("col_group[eq]", col_group)
      url.searchParams.set("row_group[eq]", row_group)
    
  
      
      try {
        const response = await fetch(url.toString() ,  { cache: "no-store" } )
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const responseData = await response.json()
        
        return responseData
      } catch (error) {
        console.error('Error fetching matrix headers:', error)
        throw error
      }
    }

export async function getChallengeData(
    broker_id:string,
    is_placeholder:string,
    category_id:string,
    step_id:string,
    amount_id:string|null,
    language:string,
    zone_id:string|null,
   ) :Promise<any> {
    const params = new URLSearchParams({
        broker_id: broker_id,
        is_placeholder: is_placeholder,
        category_id: category_id,
        step_id: step_id,
        language: language,
        ...(amount_id && { amount_id }),
        ...(zone_id && { zone_id }),
      });

      try {
      const response = await fetch(`${BASE_URL}/challenges?${params}`);
      console.log("Fetching initial data from:", `${BASE_URL}/challenges?${params}`);
      if (response.ok) {
        const result = await response.json();
        console.log("API response:", result);
        if (result.success && result.data && result.data.matrix) {
            console.log("Initial data loaded:", result.data.matrix);
            return {
              "initialData": result.data.matrix,
              "matrix":result.data?.matrix,
              "is_placeholder": result.data.is_placeholder,
              "affiliate_master_link": result.data?.affiliate_master_link,
              "affiliate_link": result.data?.affiliate_link,
              "evaluation_cost_discount": result.data?.evaluation_cost_discount,
              "matrix_placeholders_array": result.data?.matrix_placeholders_array,
              "affiliate_master_link_placeholder": result.data?.affiliate_master_link_placeholder,
              "affiliate_link_placeholder": result.data?.affiliate_link_placeholder,
              "evaluation_cost_discount_placeholder": result.data.evaluation_cost_discount_placeholder
            };
        } else {
            console.log("No initial data found, will create empty matrix");
            return {};
        }
      } else {
            console.log("Failed to fetch initial data, status:", response.status);
            return {};
        }
    } catch (error) {
        console.error("Failed to fetch initial data, status:", error);
        throw error;
      }
   }