"use server";
import { BASE_URL } from "@/constants";
import logger from "@/lib/logger";
import { UrlPayload } from "@/types/Url";
import { validateId } from "@/lib/validateId";

export async function saveAccountTypeLink(data:UrlPayload)
{
    let {urlable_id} = data;
    let url: URL | undefined;
   
    try{
        let validatedUrlableId = validateId(urlable_id,{nullable:true});
        url = new URL(BASE_URL + `/account-types/${validatedUrlableId}/urls`);
        logger.info('=>=>=>broker-profile[...optionCategory]/actions.ts/saveAccountTypeLink(): server payload', 
                    { context: {validatedUrlableId,url,data,payload:JSON.stringify(data)} });

    const response = await fetch(url.toString(), {
        method: data.id ? "PUT" : "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });
       return response.json();
    }catch(error){
       logger.error('=>=>=>broker-profile[...optionCategory]/actions.ts/saveAccountTypeLink(): error', { error, context: {url,data} });
        throw new Error("Failed to save link");
    }
}

export async function deleteAccountTypeLink(link_id: number,account_type_id: number|null, broker_id: number) {

    // account_type_id = validateId(account_type_id,{nullable:true});
    // link_id = validateId(link_id);
    // broker_id = validateId(broker_id);
    const url = new URL(BASE_URL + `/account-types/${account_type_id}/urls/${link_id}`);
   
    try{
        const response = await fetch(url.toString(), {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        return response.json();
    }catch(error){
        console.error("DELETE LINK ERROR",error);
        throw new Error("Failed to delete link");
    }
}


export async function deleteAccountType(account_type_id: number, broker_id: number) {

    console.log("DELETE ACCOUNT TYPE",account_type_id,broker_id);
    const url = new URL(BASE_URL + `/account-types/${account_type_id}`);
    url.searchParams.set('broker_id', broker_id.toString());
    try{
        const response = await fetch(url.toString(), {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        return response.json();
    }catch(error){
        console.error("DELETE ACCOUNT TYPE ERROR",error);
        throw new Error("Failed to delete account type");
    }
}