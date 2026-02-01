import { BASE_URL } from "@/constants";
import { Company } from "@/types";

export async function getCompanies(broker_id:number,company_id:number|null=null,zone_code:string|null=null,language_code:string|null=null):Promise<Company[]>{
    const url = new URL(`${BASE_URL}/companies/${broker_id}`);
    if(zone_code){
        url.searchParams.append("zone_code", zone_code);
    }
   
    if(language_code){
        url.searchParams.append("language_code", language_code);
    }
   // url.searchParams.append("broker_id", broker_id.toString());
    if(company_id){
        url.searchParams.append("company_id", company_id.toString());
    }
 
 
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