import { BASE_URL } from "@/constants";

export const getLocaleFlags = async () => {
    const url = new URL(`${BASE_URL}/locales`);
  

    const res = await fetch(url.toString(), { cache: "no-store" });

    //{ next: { revalidate: 7200 } }
  
    if (!res.ok) {
      throw new Error(`Failed to fetch translations: ${res.statusText}`);
    }
  
    const data = await res.json();

  
    // Check if data.value is null and throw an error if so
    const value = data?.data;
    if (value === null) {
      throw new Error("The locales flags array value is null.");
    }
  
    return value;  // Return the value if it's valid
  };
  