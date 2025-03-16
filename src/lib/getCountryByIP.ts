
export const getCountryByIP = async (ip: string): Promise<string | null> => {

    // const apiKey = process.env.IPREGISTRY_API_KEY;
    const apiKey = 'ira_Yqs7i0q8xk09d6HPG9De8cqBLmU8bZ4RIHgc';

    if (!apiKey) {
        console.error('IPREGISTRY_API_KEY is not defined');
        return null;
    }

    try {
        const response = await fetch(`https://api.ipregistry.co/${ip}?key=${apiKey}`);

        if (!response.ok) {
            console.error(`Failed to fetch country code: ${response.status} ${response.statusText}`);
            return null;
        }
        const data = await response.json();

        if (data.security.is_proxy || data.security.is_vpn || data.security.is_tor) {
            console.error("Access Denied: Proxy/VPN detected.");
            return null;
          }
        return data?.location?.country?.code || null;
    } catch (error: unknown) {
        console.error('Error fetching country code:', error);
        return null;
    }
}