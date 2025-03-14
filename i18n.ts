import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers"; // Acces la headers

const locales = ["fr", "en"];

export default getRequestConfig(async ({ requestLocale,req }) => {
    const locale = await requestLocale; // Așteptăm valoarea promisă

    if (!locale || !locales.includes(locale)) {
        notFound();
    }

    

         // Așteptăm să obținem header-ele și citim cookie-ul
    const headerValues = await headers(); // Așteptăm promisiunea
    const cookieHeader = headerValues.get("cookie"); // Accesăm cookie-ul din headers

    
    // Parse cookies from the cookieHeader
    const cookies = cookieHeader
        ? Object.fromEntries(cookieHeader.split(";").map(cookie => {
            const [key, value] = cookie.trim().split("=");
            return [key, value];
        }))
        : {};

    // Extract the countryCode from cookies if it exists
    const countryCode = cookies["countryCode"] || null;

    console.log("*********Country code from cookie:", cookieHeader?.split(";")); // L

    const headerValues1 = headers();
    const countryCode1 = headerValues.get('X-Country-Code');
    console.log("6666666666666666666666666Country Code from Header:", countryCode1);

    const countryCode = req.countryCode;

    console.log("Country Code from req object:", countryCode);

    return {
        locale, 
        messages: (await import(`@/messages/${locale}.json`)).default
    };
});
