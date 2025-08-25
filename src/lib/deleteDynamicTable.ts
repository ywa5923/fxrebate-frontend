import { BASE_URL } from "@/constants";

export async function deleteDynamicTable(table_name:string,id: number, broker_id: number) {

    
    const url = new URL(BASE_URL + `/${table_name}/${id}`);
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
        console.error("DELETE DYNAMIC TABLE ERROR",error);
        throw new Error("Failed to delete dynamic table");
    }
}