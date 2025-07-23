"use server";
import { BASE_URL } from "@/constants";

export async function saveAccountTypeLink(data: {id: number | null,broker_id: number,urlable_id: number|null;urlable_type: string,
    url_type: string, name: string, url: string})
{
    const {broker_id, urlable_id, urlable_type, ...rest} = data;
    const url = new URL(BASE_URL + `/account-types/${urlable_id||0}/urls`);
   // url.searchParams.set('broker_id', broker_id.toString());
    console.log("data===server=======",JSON.stringify(data));
    console.log("url===server=======",url.toString());
    try{
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
        console.error("error===server=======",error);
        throw new Error("Failed to save link");
    }
}

export async function deleteAccountTypeLink(link_id: number,account_type_id: number|null, broker_id: number) {

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