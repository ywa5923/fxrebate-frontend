import { BASE_URL } from "@/constants";
import { DynamicTableRow } from "@/types";
import logger from "./logger";


export async function getAccountTypes(broker_id:number,zone_code:string|null=null,language_code:string|null=null):Promise<DynamicTable[]>{
    const url = new URL(`${BASE_URL}/account-types`);
    const urlLogger = logger.child('lib/getAccountTypes');

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
        logger.info('==============url=================',{url:url.toString()});
        if(!response.ok){
           urlLogger.error('Failed to fetch account types', { error:response.status, context: {url:url.toString(), broker_id,zone_code,language_code} });
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData=await response.json();
       
        return responseData.data as DynamicTableRow[];

    }catch(error){
        urlLogger.error('Error fetching companies:', { error, context: {url:url.toString(), broker_id,zone_code,language_code} });
        throw error;
    }
}