import { BASE_URL } from "@/constants";

export const getTranslations = async (locale: string, zone: string,key:string,section:string) => {
    const url = new URL(`${BASE_URL}/locale_resources`);
    url.searchParams.append("key[eq]", key);
    url.searchParams.append("lang[eq]", locale);
    url.searchParams.append("zone[eq]", zone);
    section.includes(",") ? url.searchParams.append("section[in]", section) : url.searchParams.append("section[eq]", section);

    const res = await fetch(url.toString(), { cache: "no-store" });

    //{ next: { revalidate: 7200 } }
  
    if (!res.ok) {
      throw new Error(`Failed to fetch translations: ${res.statusText}`);
    }
  
    const data = await res.json();

  
    // Check if data.value is null and throw an error if so
    const value = data?.data;
    if (value === null) {
      throw new Error("Translation value is null.");
    }
  
    return value;  // Return the value if it's valid
  };
  