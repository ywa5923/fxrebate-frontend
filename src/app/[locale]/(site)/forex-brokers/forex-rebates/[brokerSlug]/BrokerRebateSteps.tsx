import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { labels: string[]; currentStep: number; ariaLabel: string; verticalOnMobile?: boolean };

export default function BrokerRebateSteps({ labels, currentStep, ariaLabel, verticalOnMobile = false }: Props) {
  return (
    <ol
      aria-label={ariaLabel}
      className={cn(
        "flex w-full gap-[13px] sm:mx-auto sm:max-w-[600px] sm:items-center sm:justify-center",
        verticalOnMobile ? "flex-col sm:flex-row" : "items-center justify-center",
      )}
    >
      {labels.map((label, index) => {
        const active = currentStep === index + 1;
        const completed = currentStep > index + 1;
        return (
          <li
            key={index}
            aria-current={active ? "step" : undefined}
            className={cn("flex min-w-0 sm:flex-row sm:items-center sm:gap-[13px]", verticalOnMobile ? "flex-col" : "items-center gap-[13px]")}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span aria-hidden className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px]",
                active ? "border-[#ffd369]" : completed ? "border-[#1d885b] bg-[#1d885b] text-white" : "border-black/25 dark:border-white/35",
              )}>
                {active && <span className="size-4 rounded-full bg-[#ffd369]" />}
                {completed && <Check className="size-4" />}
              </span>
              <span className={cn(
                "min-w-0 text-sm font-medium leading-[1.11] [overflow-wrap:anywhere] sm:text-base",
                active || completed ? "text-[#0c110f] dark:text-white" : "text-[#0c110f]/60 dark:text-white/60",
                verticalOnMobile && completed && "max-sm:text-[#0c110f]/60 max-sm:dark:text-white/60",
              )}>
                {label}
              </span>
            </div>
            {index < labels.length - 1 && (
              <span aria-hidden className={cn(
                "shrink-0 bg-black/35 dark:bg-white/45 sm:ml-0 sm:mt-0 sm:h-px sm:w-8 lg:w-[82px]",
                verticalOnMobile ? "ml-[11px] mt-[13px] h-[42px] w-px" : "h-px w-5 min-[360px]:w-[42px]",
              )} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
