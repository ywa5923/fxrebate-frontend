import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  itemClassName?: string;
  maskImage?: boolean;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children?: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
  style?: React.CSSProperties & { "--duration"?: string };
}

export const Marquee: React.FC<MarqueeProps> = ({
  className,
  itemClassName,
  reverse,
  maskImage,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}) => {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        {
          "[mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]": maskImage,
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            onTouchStart={pauseOnHover ? () => {
              document.querySelectorAll('.animate-marquee, .animate-marquee-vertical').forEach(el => {
                el.classList.add('[animation-play-state:paused]');
              });
            } : undefined}
            onTouchEnd={pauseOnHover ? () => {
              document.querySelectorAll('.animate-marquee, .animate-marquee-vertical').forEach(el => {
                el.classList.remove('[animation-play-state:paused]');
              });
            } : undefined}
            key={i}
            className={cn("flex shrink-0 justify-around [gap:var(--gap)]",
              {
                "animate-marquee flex-row [animation-duration:var(--duration)]": !vertical,
                "animate-marquee-vertical flex-col [animation-duration:var(--duration)]": vertical,
                "group-hover:[animation-play-state:paused]": pauseOnHover,
                "[animation-direction:reverse]": reverse,
              },
              itemClassName
            )}
          >
            {children}
          </div>
        ))}
    </div>
  );
};
