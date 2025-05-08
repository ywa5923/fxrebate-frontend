import MyComponent from "@/components/MyComponent";
import { TranslationProvider } from "@/providers/translations";
import { BASE_URL } from "@/constants";
import { buildBrokerUrl } from "@/lib/buildBrokerUrl";
import { BrokersSearchParams } from "@/types";
import { BrokerOptions } from "@/types";
import { AutoTable } from "./AutoTable";
import Pagination from "./Paginations";
export const dynamic = "force-dynamic";
import { getZoneFromCookie } from "@/lib/getZoneFromCookie";

type Params = { locale: string };


interface BrokerPageProps {
  searchParams?: Promise<BrokersSearchParams>;
  params: Promise<Params>;
}
export default async function Brokers({
  searchParams,
  params,
}: BrokerPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const locale = resolvedParams.locale;

  const zone = await getZoneFromCookie();
  if(!zone){
    throw new Error("Zone not found");
  }

 

  //const t = await getTranslations(locale);
  const [data, totalPages] = await getBrokers( locale,zone, resolvedSearchParams);
  const [dynamicColumns,defaultLoadedColumns,allowSortingOptions,booleanOptions,ratingOptions ]= await getDynamicOptions(locale);

 
  let filter_options = await getFilters(locale, zone);
 
  const booleanOptionsSlugs=Object.keys(booleanOptions);

  const ratingOptionsSlugs=Object.keys(ratingOptions);

  const columns = {...defaultLoadedColumns,...dynamicColumns };
//   <TranslationProvider translations={t}>
//   <MyComponent />
// </TranslationProvider>
 
  return (
    <div className="container mx-auto py-10">
    <AutoTable
      data={data}
      columnNames={columns}
      filters={filter_options}
      defaultLoadedColumns={defaultLoadedColumns}
      allowSortingOptions={allowSortingOptions}
      booleanOptions={booleanOptionsSlugs}
      ratingOptions={ratingOptionsSlugs}
    />
    <Pagination totalPages={totalPages} />
  </div>
  );
}



const getBrokers = async (
  locale: string,
  zone: string,
  searchParams?: BrokersSearchParams|{}
) => {

  const url = buildBrokerUrl(locale,zone, searchParams);
  
  console.log("url=========================", url);

  const res = await fetch(url, { cache: "no-store" });

  const brokers = await res.json();

  return [brokers.data, Math.ceil(brokers.meta.total / brokers.meta.per_page)];
  //backend tested with http://localhost:8000/api/v1/brokers?language[eq]=ro&page=1&columns[in]=trading_name,trading_fees,account_type,jurisdictions,promotion_title,fixed_spreads,support_options&order_by[eq]=+account_type
};

const getDynamicOptions = async (locale: string) => {
    let url = `${BASE_URL}/broker_options?language[eq]=${locale}`;

    try {
        const res = await fetch(url, { cache: "no-store" });
        console.log("res=========================", res);
        console.log("url=========================", url);

        if (!res.ok) {
          const errorData = await res.json();
           console.error("errorData=========================", errorData);
            console.error(`Error fetching dynamic options data: ${res.status} ${res.statusText}`);
            throw new Error("Could not fetching broker options from server.Please try again later");
        }

        const brokerOptions: BrokerOptions = await res.json().catch(() => {
            console.error("Invalid JSON response received for brokerOptions");
            throw new Error("Could not load broker options from server.Please try again later");
        });
     
       
        return [
            brokerOptions.options || [],
            brokerOptions.defaultLoadedOptions || [],
            brokerOptions.allowSortingOptions || [],
            brokerOptions.booleanOptions || [],
            brokerOptions.ratingOptions || [],
        ];
    } catch (error) {
        console.error("Network error or unexpected issue:", error,url);
        throw new Error("Could not load broker options from server.Please try again later:"+url);
    }
};


const getFilters = async (locale: string, zone: string) => {
  try {
    const url = `${BASE_URL}/broker-filters?language[eq]=${locale}&country[eq]=ro&zone[eq]=${zone}`;
    console.log("Fetching filters from:", url);
    
    const res = await fetch(url, { 
      cache: "no-store",
      headers: {
        'Accept': 'application/json'
      }
    });

    // First check if we got HTML instead of JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      console.error("Received non-JSON response:", text.substring(0, 200)); // Log first 200 chars
      throw new Error(`Invalid response type: ${contentType}`);
    }

    if (!res.ok) {
      const errorData = await res.clone().json();
      console.error("FiltersErrorData:", errorData);
      throw new Error(`Failed to fetch filters: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching filters:", error);
    if (error instanceof Error) {
      throw new Error(`Could not load filters: ${error.message}`);
    }
    throw new Error("Could not load filters. Please try again later.");
  }
}
