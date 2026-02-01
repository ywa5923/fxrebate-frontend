import { BASE_URL } from "@/constants";
import { getBearerToken } from "./auth-actions";

export const getOptionsValues = async (
    entity_id: number = 1,
    entity_type: string = "Brokers",
    category_id: string | null = null,
    locale: string = "en",
    zone_code: string | null = null,
    expanded: boolean = false

): Promise<any> => {

    // http://localhost:8080/api/v1/option-values?broker_id=1&zone_code=ro&category_id=2&language_code=ro

    const url = new URL(`${BASE_URL}/option-values/${entity_id}`);
  
    url.searchParams.append("language_code", locale);
    url.searchParams.append("entity_type", entity_type);

    //if (entity_id) url.searchParams.append("broker_id", entity_id.toString());
    if (zone_code) url.searchParams.append("zone_code", zone_code);
    if (category_id) url.searchParams.append("category_id", category_id);

  //  console.log("Fetching broker options with URL:", url.toString());

    try {
        const token = await getBearerToken();
        const headers: HeadersInit = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        };

        const response = await fetch(url.toString(), { cache: "no-store", headers });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if(expanded) {
            return data.data;
        }else{
            return data.data.map((item: any) => ({
                id: item.id,
                option_slug: item.option_slug,
                value: item.value,
                public_value: item.public_value,
                ...(item?.metadata?.unit ? { metadata: item.metadata,isNumberWithUnit:true } : {}),
               
              
            }));
        }
        return data;
    } catch (error) {
        console.error('Error fetching options values:', error);
        throw error;
    }
};