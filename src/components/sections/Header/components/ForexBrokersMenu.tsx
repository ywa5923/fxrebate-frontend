"use client";

import Image from "next/image";
import { useId, useRef } from "react";
import { ChevronRight, Loader2, RotateCw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslation } from "@/providers/translations";
import { cn } from "@/lib/utils";
import type { BrokerShortList } from "./useBrokerShortList";

type Props = {
  list: BrokerShortList;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mobile?: boolean;
};

function BrokerList({ list }: Pick<Props, "list">) {
  const { t } = useTranslation("navbar");

  if (list.status === "idle" || list.status === "loading") {
    return (
      <div role="status" aria-label={t("forex_brokers")} aria-busy="true" className="flex min-h-24 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  if (list.status === "error") {
    return (
      <div className="flex min-h-24 items-center justify-center gap-3">
        <p role="alert" className="text-sm">{t("brokers_list_error")}</p>
        <Button variant="ghost" size="icon" onClick={list.load} title={t("brokers_list_retry")} aria-label={t("brokers_list_retry")}>
          <RotateCw className="size-4" />
        </Button>
      </div>
    );
  }

  if (list.brokers.length === 0) {
    return <p role="status" className="py-6 text-center text-sm">{t("brokers_list_empty")}</p>;
  }

  return (
    <ul className="columns-[152px] gap-4 text-sm font-medium leading-[19px]">
      {list.brokers.map((broker) => (
        <li key={broker.id} className="break-inside-avoid pb-5">
          <div className="flex min-h-10 min-w-0 items-center gap-2 text-[#0c110f] dark:text-white">
            <Avatar className="size-10 bg-[#fff]">
              <AvatarImage src={broker.logo ?? undefined} alt="" className="object-contain" />
              <AvatarFallback className="bg-gray-100 text-xs text-gray-700">
                {broker.trading_name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 [overflow-wrap:anywhere]">{broker.trading_name}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ForexBrokersMenu({ list, open, onOpenChange, mobile = false }: Props) {
  const { t } = useTranslation("navbar");
  const panelId = useId();
  const openedWithPointer = useRef(false);

  function changeOpen(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (nextOpen) void list.load();
  }

  const trigger = (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={open ? panelId : undefined}
      onMouseEnter={mobile ? undefined : () => {
        openedWithPointer.current = true;
        changeOpen(true);
      }}
      onKeyDown={(event) => {
        openedWithPointer.current = false;
        if (!mobile && (event.key === "ArrowRight" || event.key === "ArrowDown")) {
          event.preventDefault();
          changeOpen(true);
        }
      }}
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-sm text-left font-medium outline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-green-600",
        mobile ? "min-h-11 text-base" : "w-full justify-between py-1 text-sm leading-[19px] hover:text-green-700 dark:text-white/80 dark:hover:text-green-400",
        open && "text-green-700 dark:text-green-400",
      )}
      onClick={(event) => {
        event.preventDefault();
        openedWithPointer.current = false;
        changeOpen(mobile ? !open : true);
      }}
    >
      {t("forex_brokers")}
      <ChevronRight className={cn("size-4 shrink-0 transition-transform", mobile && open && "rotate-90")} aria-hidden="true" />
    </button>
  );

  if (mobile) {
    return (
      <div className="flex w-full min-w-0 flex-col items-center">
        {trigger}
        {open && (
          <div id={panelId} className="mt-3 w-full min-w-0 bg-[#fff] px-6 pt-5 dark:bg-[#222]">
            <div
              role="region"
              aria-label={t("forex_brokers")}
              tabIndex={0}
              className="max-h-[min(420px,55dvh)] overflow-y-auto overscroll-contain rounded-sm outline-offset-2 [scrollbar-color:#a3a3a3_transparent] [scrollbar-gutter:stable] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:outline-green-600 dark:[scrollbar-color:#737373_transparent]"
            >
              <BrokerList list={list} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        id={panelId}
        aria-label={t("forex_brokers")}
        side="right"
        align="start"
        alignOffset={-48}
        sideOffset={5}
        collisionPadding={24}
        onOpenAutoFocus={(event) => {
          if (openedWithPointer.current) {
            event.preventDefault();
          }
        }}
        onEscapeKeyDown={(event) => event.stopPropagation()}
        data-menu-item
        className="z-[10000] hidden w-[1113px] max-w-[var(--radix-popover-content-available-width)] rounded-lg border-0 bg-[#fff] p-8 pb-3 text-[#0c110f] shadow-[0_4px_28px_rgba(196,196,196,0.35)] lg:block dark:bg-[#222] dark:text-white dark:shadow-[0_4px_28px_rgba(0,0,0,0.44)]"
      >
        <Image src="/assets/icons/brokers-panel-pointer-light.svg" alt="" width={12} height={8} className="absolute -top-[7px] left-[100px] dark:hidden" />
        <Image src="/assets/icons/brokers-panel-pointer-dark.svg" alt="" width={12} height={8} className="absolute -top-[7px] left-[100px] hidden dark:block" />
        <div
          role="region"
          aria-label={t("forex_brokers")}
          tabIndex={0}
          className="max-h-[min(500px,calc(var(--radix-popover-content-available-height)-64px))] overflow-y-auto overscroll-contain rounded-sm outline-offset-2 [scrollbar-color:#a3a3a3_transparent] [scrollbar-gutter:stable] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:outline-green-600 dark:[scrollbar-color:#737373_transparent]"
        >
          <BrokerList list={list} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
