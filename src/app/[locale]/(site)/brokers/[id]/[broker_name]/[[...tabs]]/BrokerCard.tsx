'use client';
import { cn } from '@/lib/utils';
import { Rating } from '@/components/ui/rating';
import { Button } from '@/components/ui/MButton';
import { Button as ShadcnButton } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface BrokerCardProps {
  logoUrl: string;
  brokerName: string;
  customText: string;
  overallRating: number;
  userRating: number;
  overallReviews?: number;
  userReviews?: number;
  isAvailable: boolean;
  className?: string;
}

export const BrokerCard = ({
  logoUrl,
  brokerName,
  customText,
  overallRating,
  userRating,
  overallReviews,
  userReviews,
  isAvailable,
  className
}: BrokerCardProps) => {
  return (
    <div className={cn("bg-background px-4 py-3", className)}>
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Logo */}
        <img
          src={logoUrl}
          alt={`${brokerName} logo`}
          className="w-16 h-16 object-contain"
        />
        
        {/* Content section */}
        <div className="flex flex-col w-full">
          {/* Top section with broker info and ratings */}
          <div className="flex flex-col sm:flex-row w-full">
            {/* Broker details - left side */}
            <div className="flex-1">
              {/* Broker name and review heading */}
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold dark:text-gray-100">{brokerName}</h3>
                <span className="text-lg font-semibold dark:text-gray-100">Review</span>
              </div>
              
              {/* Custom text */}
              <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                {customText}
              </p>
              
              {/* Availability indicator */}
              <div className="mt-1 mb-2">
                {isAvailable ? (
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={20} className="text-green-500" />
                    <span className="text-sm font-medium">Available in your country</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <XCircle size={20} className="text-red-500" />
                    <span className="text-sm font-medium">Not available in your country</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Ratings - left on mobile, right on desktop */}
            <div className="flex justify-start sm:justify-end sm:ml-auto">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground dark:text-gray-400 mb-1">Overall rating</span>
                  <Rating value={overallRating} totalReviews={overallReviews} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground dark:text-gray-400 mb-1">User rating</span>
                  <Rating value={userRating} totalReviews={userReviews} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Buttons section - full width on mobile, auto width on desktop */}
          <div className="flex flex-col sm:flex-row gap-2 w-full mt-4 sm:justify-start">
            <Button
              buttonContainerClassName="w-full sm:w-auto text-center"
              buttonClassName="text-xs h-9 rounded-md px-4 [&>span]:text-xs [&>div]:min-h-6 [&>div]:min-w-6 [&>div]:p-0.5 w-full sm:w-auto justify-center"
              text="Get Cashback"
              iconImage="/assets/icons/arrow-right.svg"
              href="#"
            />
            <ShadcnButton variant="outline" size="default" className="text-xs dark:bg-background w-full sm:w-auto text-center">
              VisitAdmirals (Admiral Markets)
            </ShadcnButton>
            <ShadcnButton variant="default" size="default" className="text-xs bg-black dark:bg-gray-400 w-full sm:w-auto text-center">
              Submit Review
            </ShadcnButton>
          </div>
        </div>
      </div>
    </div>
  );
};