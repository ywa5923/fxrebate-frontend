import { BASE_URL } from "@/constants";
import { Company } from "@/types";

export async function getAccountTypes(broker_id:number,account_type_id:number|null=null,zone_code:string|null=null,language_code:string|null=null):Promise<Company[]>{
    const url = new URL(`${BASE_URL}/account-types`);
    if(zone_code){
        url.searchParams.append("zone_code", zone_code);
    }
   
    if(language_code){
        url.searchParams.append("language_code", language_code);
    }
    url.searchParams.append("broker_id", broker_id.toString());
    if(account_type_id){
        url.searchParams.append("account_type_id", account_type_id.toString());
    }
 
 
    try{
        const response=await fetch(url.toString());
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