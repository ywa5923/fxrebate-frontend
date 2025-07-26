import { BASE_URL } from "@/constants";
import { Company } from "@/types";

export async function getAccountTypes(broker_id:number,zone_code:string|null=null,language_code:string|null=null):Promise<Company[]>{
    const url = new URL(`${BASE_URL}/account-types`);

    //if zone code is not send it recive account types with options values that have zone_code null and also zone_id null
    if(zone_code){
        url.searchParams.append("zone_code", zone_code);
    }
   
    if(language_code){
        url.searchParams.append("language_code", language_code);
    }
    url.searchParams.append("broker_id", broker_id.toString());
    
 
 
    try{
        const response=await fetch(url.toString(),{cache:"no-store"});
        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData=await response.json();
        return responseData.data as Company[];

    }catch(error){
        console.error('Error fetching companies:', error);
        throw error;
    }
}