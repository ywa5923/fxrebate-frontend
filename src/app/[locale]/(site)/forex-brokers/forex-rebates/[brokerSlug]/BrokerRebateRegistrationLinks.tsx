import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SetupRegistrationLink } from "./setupFormData";

type Props = { links: SetupRegistrationLink[]; buttonLabel: string; emptyLabel: string };

export default function BrokerRebateRegistrationLinks({ links, buttonLabel, emptyLabel }: Props) {
  if (links.length === 0) return <p role="status" className="text-sm">{emptyLabel}</p>;

  return (
    <div className="flex flex-col gap-10">
      {links.map((link, index) => (
        <div key={`${link.url}-${index}`} className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <h2 className="min-w-0 text-[28px] font-bold leading-[1.11] [overflow-wrap:anywhere] sm:text-[32px]">
            {link.name}
          </h2>
          <Button asChild className="flex h-auto min-h-12 w-full shrink-0 items-center justify-between gap-3 whitespace-normal rounded-lg border border-[#1d885b] bg-gradient-to-r from-[rgba(0,106,61,0.8)] to-[rgba(0,66,23,0.8)] pl-6 pr-2 text-left text-base font-medium text-white hover:brightness-110 sm:w-[255px]">
            <a href={link.url} target="_blank" rel="noopener noreferrer" aria-label={`${buttonLabel}: ${link.name}`}>
              <span className="min-w-0 [overflow-wrap:anywhere]">{buttonLabel}</span>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-[5px] bg-[#1d885b]">
                <ChevronRight className="size-5" aria-hidden />
              </span>
            </a>
          </Button>
        </div>
      ))}
    </div>
  );
}
