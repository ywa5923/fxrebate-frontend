import { FiStar } from "react-icons/fi";
import * as Slider from "@radix-ui/react-slider";
import { useState } from "react";

type RatingComponentProps = {
  value?: number;
  onChange?: (value: number) => void;
};

export function RatingComponent({ value = 0, onChange }: RatingComponentProps) {
  const [rating, setRating] = useState<number>(value);
  const stars = 5;

  const handleRatingChange = (val: number[]) => {
    setRating(val[0]);
    onChange?.(val[0]);
  };

  return (
    <div className="flex bg-white items-center border-none p-2">
      <Slider.Root
        className="relative flex items-center gap-1"
        min={0}
        max={stars}
        step={0.5}
        value={[rating]}
        //onValueChange={handleRatingChange}
      >
        {Array.from({ length: stars }).map((_, index) => {
          const isHalf = rating > index && rating < index + 1;
          const isFull = rating >= index + 1;
          return (
            <div key={index} className="relative w-6 h-6 flex items-center justify-center overflow-hidden">
              <FiStar
                size={24}
                fill={isFull ? "gold" : "lightgray"}
                strokeWidth={0}
                cursor="pointer"
              />
              {isHalf && (
                <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
                  <FiStar size={24} fill="gold" strokeWidth={0} cursor="pointer" />
                </div>
              )}
            </div>
          );
        })}
      </Slider.Root>
    </div>
  );
}
