
import { RatingsTable } from '@/components/RatingsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rating } from '@/components/ui/rating';
import { ReactNode } from 'react';
import { BrokerProfile } from './BrokerProfile';
import { Headquarters } from './Headquarters';
import { SupportedLanguages } from './SupportedLanguages';
interface BrokerInfo {
  name: string;
  founded: string;
  headquarters: string;
  offices: string;
  accountCurrency: string;
  supportedLanguages: string[];
  fundingMethods: string;
  financialInstruments: string;
  prohibitedCountries: string;
  services: string;
  minimumDeposit: string;
  tradingPlatforms: string[];
  accountTypes: string[];
  ratings: {
    category: string;
    value: number;
    weight: number;
    totalReviews?: number;
  }[];
}

interface GeneralInformationProps {
  brokerId: string;
  brokerName: string;
}

async function getBrokerInfo(brokerId: string, brokerName: string): Promise<BrokerInfo> {
  // Replace this with your actual API call
  // For now, return mock data including ratings
  return {
    name: brokerName,
    founded: "2010",
    headquarters: "London, UK",
    offices: "London, UK",
    accountCurrency: "USD, EUR, GBP, CAD, AUD, CHF, JPY, NZD, RUB, CNY, INR, MXN, ZAR, SGD, HKD, KRW, TWD, THB, PHP, IDR, MYR, VND, PLN, BRL, CZK, DKK, NOK, SEK, TRY, RON, HUF, ARS, COP, EGP, ILS, MAD, PKR, QAR, SAR, TND, VES, ZMW",
    supportedLanguages: ["USA", "Spain", "France", "Germany", "Italy", "Portugal", "Russian", "Chinese", "Japan", "Korean", "turkey", "Philippines","Poland"],
    fundingMethods: "Credit Card, Debit Card, Bank Transfer, Skrill, Neteller, PayPal, Wire Transfer, Crypto",
    financialInstruments:"Futures,Forex,CFDs,Stocks,Indices,Commodities,Cryptocurrencies",
    prohibitedCountries: "United States, Cuba, Iran, North Korea, Crimea, Donetsk",
    minimumDeposit: "$100",
    services:"24 hour support, Live Chat, Email Support, Phone Support, Islamic Account, Variable spread, Trailing stops",
    tradingPlatforms: ["MT4", "MT5", "WebTrader"],
    accountTypes: ["Standard", "Premium", "VIP"],
    ratings: [
      {
        category: "Customer Service",
        value: 4.5,
        weight: 0.25,
        totalReviews: 256
      },
      {
        category: "Trading Platforms",
        value: 4.8,
        weight: 0.20,
        totalReviews: 189
      },
      {
        category: "Trading Costs",
        value: 4.2,
        weight: 0.30,
        totalReviews: 312
      },
      {
        category: "Research & Education",
        value: 4.6,
        weight: 0.15,
        totalReviews: 178
      },
      {
        category: "Mobile Experience",
        value: 4.7,
        weight: 0.10,
        totalReviews: 223
      },
      {
        category: "Overall Rating",
        value: 4.7,
        weight: 0.10,
        totalReviews: 223
      }
    ]
  };
}

export async function GeneralInformation({ brokerId, brokerName }: GeneralInformationProps): Promise<ReactNode> {
  const brokerInfo = await getBrokerInfo(brokerId, brokerName);

  return (
    <div className="space-y-6">
     
        <div className="space-y-4">
          <div className="grid grid-cols-1  gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{brokerInfo.name} Overall Rating</h1>
              <div className="flex justify-start">
                <span className="text-muted-foreground">Overall Rating</span>
                <Rating value={brokerInfo.ratings[0].value} />
              </div>
            </div>
            <RatingsTable
            ratings={brokerInfo.ratings}
            className="bg-background rounded-lg"
          />
          <BrokerProfile
            logoUrl="/images/admiral-markets-logo.svg" 
            foundedYear="2001"
            companyName="Admiral Markets Pty Ltd"
            categories={["Forex Broker", "Forex Rebates"]}
          />
         <Headquarters coordinates="51.5074,-0.1278;40.7128,-74.0060" />
         <SupportedLanguages languages={brokerInfo.supportedLanguages} />

            <div className="space-y-2">
              <div className="flex justify-start">
                <span className="text-muted-foreground">Founded</span>
                <span className="font-medium">{brokerInfo.founded}</span>
              </div>
              <div className="flex justify-start">
                <span className="text-muted-foreground">Headquarters</span>
                <span className="font-medium">{brokerInfo.headquarters}</span>
              </div>
              <div className="flex justify-start">
                <span className="text-muted-foreground">Offices</span>
                <span className="font-medium">{brokerInfo.offices}</span>
              </div>
              <div className="flex justify-start">
                <span className="text-muted-foreground">Minimum Deposit</span>
                <span className="font-medium">{brokerInfo.minimumDeposit}</span>
              </div>
            </div>
        
              <div>
                <span className="text-muted-foreground">Trading Platforms</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {brokerInfo.tradingPlatforms.map((platform: string) => (
                    <span
                      key={platform}
                      className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Account Types</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {brokerInfo.accountTypes.map((type: string) => (
                    <span
                      key={type}
                      className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            
          </div>
       </div>

       
    </div>
  );
}