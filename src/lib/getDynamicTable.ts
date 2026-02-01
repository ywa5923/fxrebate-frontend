import { BASE_URL } from "@/constants";
import { DynamicTableRow } from "@/types";
import { getBearerToken } from "./auth-actions";

export async function getDynamicTable(table_name:string,broker_id:number,zone_code:string|null=null,language_code:string|null=null):Promise<DynamicTable[]>{
    const url = new URL(`${BASE_URL}/${table_name}/${broker_id}`);

    //if zone code is not send it recive account types with options values that have zone_code null and also zone_id null
    if(zone_code){
        url.searchParams.append("zone_code", zone_code);
    }
   
    if(language_code){
        url.searchParams.append("language_code", language_code);
    }
    //url.searchParams.append("broker_id", broker_id.toString());
    
 
 
    try{
        const token = await getBearerToken();
        const headers: HeadersInit = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        };
        const response=await fetch(url.toString(),{cache:"no-store", headers});
        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData=await response.json();
        return responseData.data as DynamicTableRow[];

    }catch(error){
        console.error('Error fetching companies:', error);
        throw error;
    }
}