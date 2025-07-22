import { BASE_URL } from "@/constants";
import { LinksGroupedByAccountId, LinksGroupedByType } from "@/types/AccountTypeLinks";


export async function getAccountTypeUrls(
    broker_id:number,
    account_type_id:number|null=null,
    zone_code:string|null=null,
    language_code:string|null=null
):Promise<{ links_grouped_by_account_id: LinksGroupedByAccountId; master_links_grouped_by_type: LinksGroupedByType; links_groups: Array<string>}>{
   
    const accountType = account_type_id == null ? 'all' : account_type_id.toString();

    const url = new URL(`${BASE_URL}/urls/${broker_id}/account-type/${accountType}`);
    if(zone_code){
        url.searchParams.append("zone_code", zone_code);
    }
    if(language_code){
        url.searchParams.append("language_code", language_code);
    }
    
  
   
    try{
        const response=await fetch(url.toString());
        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData=await response.json();
        return {'links_grouped_by_account_id':responseData.links_grouped_by_account_id,
            'master_links_grouped_by_type':responseData.master_links_grouped_by_type,
            'links_groups':responseData.links_groups};
    }catch(error){
        console.error('Error fetching account type urls:', error);
        throw error;
    }
}