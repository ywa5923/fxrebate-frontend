import { Authors } from "./Authors";
import { BrokerCard } from "./BrokerCard";
import { BrokerProfile } from "./BrokerProfile";
import LocalizedLink from "@/components/LocalizedLink";
import { getTranslations } from "@/lib/getTranslations";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { GeneralInformation } from "./GeneralInformation";


const orderedTabs=['general-information','users-reviews','rebates','trading'];

export default async function TabPage({params}:{params:Promise<{id:string,broker_name:string,tabs:string[],locale:string}>}) {
    const resolvedParams = await params;
    const brokerId = resolvedParams.id;
    const broker_name = resolvedParams.broker_name;
    const brokerTab = resolvedParams.tabs?.[0] || 'overview';
    const locale = resolvedParams.locale;

    const translations = (await getTranslations(locale,'zone','broker_page','server')).server;
    
 
  const tabLabels = translations['tabs'] as Record<string,string> ;
  const tabKeys = translations['tabs-keys'] as Record<string,string>;
  
  console.log(translations);
  const getOriginalTabKey = (translatedKey: string) => {
    return Object.entries(tabKeys).find(([_, value]) => value === translatedKey)?.[0] || translatedKey;
  };

  const originalTabKey = getOriginalTabKey(brokerTab);
  
    return (
        <div className="container mx-auto p-4">
            <div className="border-b border-gray-200">
                <BrokerCard
                logoUrl={"/images/admiral-markets-logo.svg"}
                brokerName="Broker Name"
                customText="Custom Text"
                overallRating={4.5}
                userRating={4.2}
                isAvailable={true}
                />
                <nav className="-mb-px flex flex-wrap gap-4 sm:flex-nowrap sm:space-x-8">
                    {orderedTabs.map((tab_key) => (
                        <LocalizedLink
                            key={tab_key}
                            routeKey={`/brokers/${brokerId}/${broker_name}/${tab_key}`}
                            className={cn(
                                "whitespace-nowrap py-4 px-1 border-b-2 text-sm flex items-center gap-2",
                                originalTabKey === tab_key
                                    ? "border-green-700 text-black"
                                    : "border-transparent text-black hover:text-gray-600"
                            )}
                        >
                            {tabLabels[tab_key]}
                            {tab_key === 'users-reviews' && (
                                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                                    42
                                </span>
                            )}
                        </LocalizedLink> 
                    ))}
                </nav>
            </div>
            <div className="mt-4">
            <Authors 
  authors={[
    { name: "John Doe", prefix: "Edited by", imageUrl: "/path/to/image1.jpg" }, { name: "John Doe", prefix: "Updates by", imageUrl: "/path/to/image1.jpg" }

  ]}
  updatedDate="December 2004"
  rightText={[
    { text: "Last updated 2 days ago Last updated 2 days ago,Last updated 2 days ago", href: "/history" },
    { text: "View history", href: "/history" }
  ]}
/>
                {originalTabKey === 'general-information' && <GeneralInformation brokerId={brokerId} brokerName="Admirals (Admiral Markets)" />}
                {originalTabKey === 'users-reviews' && <div>Reviews Content</div>}
                {originalTabKey === 'rebates' && <div>Rebates Content</div>}
                {originalTabKey === 'trading' && <div>Trading Content</div>}
            </div>
        </div>
    );
}

