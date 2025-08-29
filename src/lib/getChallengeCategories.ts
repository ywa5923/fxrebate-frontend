import { BASE_URL } from "@/constants";
import { ChallengeType, ChallengeTypesResponse} from "@/types/ChallengeType";

export async function getChallengeCategories(language_code:string|null=null):Promise<ChallengeType[]>{
    const url = new URL(`${BASE_URL}/challenges/categories`);

    //if zone code is not send it recive account types with options values that have zone_code null and also zone_id null
   
   
    if(language_code){
        url.searchParams.append("language_code", language_code);
    }
  
 
 
    try{
        const response=await fetch(url.toString(),{cache:"no-store"});
        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData:ChallengeTypesResponse=await response.json();
        return responseData.data;

    }catch(error){
        console.error('Error fetching companies:', error);
        throw error;
    }
}