'use client';

import { Rating } from '@/components/ui/rating';

interface RatingItem {
  category: string;
  value: number;
  weight: number;
  totalReviews?: number;
}

interface RatingsTableProps {
  ratings: RatingItem[];
  className?: string;
}

export const RatingsTable = ({ ratings, className }: RatingsTableProps) => {
  return (
    <div className={className}>
      {/* Mobile view (card-like layout) */}
      <div className="md:hidden space-y-4">
        {ratings.map((rating, index) => (
          <div 
            key={rating.category}
            className={`p-4 ${index !== ratings.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-black dark:text-white">{rating.category}</span>
              <span className="text-sm text-black dark:text-white">{Math.round(rating.weight * 100)}%</span>
            </div>
            <Rating value={rating.value} totalReviews={rating.totalReviews} textColor="text-black dark:text-white" />
          </div>
        ))}
      </div>

      {/* Desktop view (table layout) */}
      <div className="hidden md:block w-full overflow-x-auto">
        <div className="w-full overflow-x-auto">
          <table className="max-w-2xl border border-gray-100 dark:border-gray-800">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="py-4 px-6 text-center" colSpan={2}>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating</span>
                </th>
                <th className="py-4 px-6 text-left">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Weight</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((rating, index) => (
                <tr key={rating.category} className={index !== ratings.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-black dark:text-white">{rating.category}</span>
                  </td>
                  <td className="py-4 px-6">
                    <Rating value={rating.value} totalReviews={rating.totalReviews} textColor="text-black dark:text-white" />
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-black dark:text-white">{Math.round(rating.weight * 100)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}; 