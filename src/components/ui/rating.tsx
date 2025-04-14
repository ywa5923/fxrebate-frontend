import { FiStar } from "react-icons/fi";

interface RatingProps {
  value: number;
  className?: string;
  totalReviews?: number;
  textColor?: string;
}

export function Rating({ value, className, totalReviews, textColor = "text-muted-foreground" }: RatingProps) {
  const stars = 5;
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;

  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4.0) return "Very Good";
    if (rating >= 3.5) return "Good";
    if (rating >= 3.0) return "Average";
    return "Poor";
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: stars }).map((_, index) => {
            const isFull = index < fullStars;
            const isHalf = index === fullStars && hasHalfStar;
            
            return (
              <div key={index} className="relative w-6 h-6 flex items-center justify-center">
                <FiStar
                  size={24}
                  fill={isFull ? "gold" : "lightgray"}
                  strokeWidth={0}
                />
                {isHalf && (
                  <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
                    <FiStar size={24} fill="gold" strokeWidth={0} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <span className={`text-xs ${textColor} underline`}>
          {totalReviews ? `${totalReviews}(${value.toFixed(1)} ${getRatingText(value)})` : `(${value.toFixed(1)} ${getRatingText(value)})`}
        </span>
      </div>
    </div>
  );
} 