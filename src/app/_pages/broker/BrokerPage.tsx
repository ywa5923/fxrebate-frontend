import { cn } from "@/lib/utils";
import Link from "next/link";

export default function BrokerPage({locale,zone,searchParams,capturedSegments}:{locale:string,zone:string,searchParams?:Record<string,string>,capturedSegments?:string[]}){
    const brokerId=capturedSegments?.[0];
    if (!brokerId) {
        throw new Error('Broker ID is required');
    }
    const brokerTab=capturedSegments?.[1]||'overview';
    
    const tabs = {
         'overview': "Overview",
        'users-reviews': "User Reviews",
        rebates: "Rebates",
        trading: "Trading"
    };

    //en/forex-broker/forex-brokers-rebates/brokerId/overview
    //en/forex-broker/forex-brokers-rebates/brokerId/users-reviews
    //en/forex-broker/forex-brokers-rebates/brokerId/rebates
    //en/forex-broker/forex-brokers-rebates/brokerId/trading

    //fr/courtier-forex/remboursements-courtiers-forex/brokerId/apercu
    //fr/courtier-forex/remboursements-courtiers-forex/brokerId/avis-utilisateurs
    //fr/courtier-forex/remboursements-courtiers-forex/brokerId/remboursements
    //fr/courtier-forex/remboursements-courtiers-forex/brokerId/trading


    return (
        <div className="container mx-auto p-4">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {Object.entries(tabs).map(([id, label]) => (
                        <Link
                            key={id}
                            href={`/${locale}/forex-broker/forex-brokers-rebates/${brokerId}/${id}`}
                            className={cn(
                                "whitespace-nowrap py-4 px-1 border-b-2 text-sm flex items-center gap-2",
                                brokerTab === id
                                    ? "border-green-700 text-black"
                                    : "border-transparent text-black hover:text-gray-600"
                            )}
                        >
                            {label}
                            {id === 'users-reviews' && (
                                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                                    42
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="mt-4">
                {brokerTab === 'overview' && <div>Overview Content</div>}
                {brokerTab === 'users-reviews' && <div>Reviews Content</div>}
                {brokerTab === 'rebates' && <div>Rebates Content</div>}
                {brokerTab === 'trading' && <div>Trading Content</div>}
            </div>
        </div>
    );
}