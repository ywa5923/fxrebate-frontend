"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BrokerRebate } from "./data";

type Props = {
  broker: BrokerRebate;
  view: "list" | "card";
};

function Stars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-[1.5px]"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "size-[14px]",
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-gray-300 dark:text-gray-600",
          )}
        />
      ))}
    </div>
  );
}

function BrokerIdentity({ broker }: { broker: BrokerRebate }) {
  return (
    <div className="flex items-center gap-4 min-w-0">
      <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
        <Image
          src={broker.logoSrc}
          alt={`${broker.name} logo`}
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>
      <div className="min-w-0">
        <h2 className="text-base font-bold capitalize text-[#0c110f] dark:text-white">
          {broker.name}
        </h2>
        <div className="mt-0.5 flex flex-wrap items-center gap-1">
          <Stars rating={broker.rating} />
          <Link
            href="#"
            className="text-sm capitalize text-[#0c110f]/60 underline underline-offset-2 hover:text-[#0c110f] dark:text-white/60 dark:hover:text-white"
          >
            {broker.reviewLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}

function PaymentMethods({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-bold capitalize text-[#0c110f] dark:text-white">
        Payment Methods
      </p>
      <div className="flex items-center gap-1 text-sm text-[#0c110f]/80 dark:text-white/80">
        <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span className="capitalize">{text}</span>
      </div>
    </div>
  );
}

function RatesGrid({
  rates,
  columns,
}: {
  rates: BrokerRebate["rates"];
  columns: "list" | "card";
}) {
  return (
    <div
      className={cn(
        "rounded px-4 py-[17px]",
        columns === "card"
          ? "bg-white dark:bg-[#0c110f]"
          : "border border-[#f0f0f0] bg-white dark:border-gray-700 dark:bg-gray-950/60",
      )}
    >
      <div
        className={cn(
          "grid gap-x-6 gap-y-2",
          columns === "list"
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-0"
            : "grid-cols-2",
        )}
      >
        {rates.map((rate, index) => (
          <div
            key={rate.label}
            className={cn(
              "flex flex-col gap-0.5",
              columns === "list" &&
                index > 0 &&
                "lg:border-l lg:border-black/10 lg:pl-6 dark:lg:border-white/10",
            )}
          >
            <span className="text-sm font-bold capitalize text-[#0c110f]/80 dark:text-white/80">
              {rate.label}
            </span>
            <span className="text-sm font-bold text-[#0c110f] dark:text-white">
              {rate.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Desktop/mobile grid card from Figma nodes 958:46384 / 958:50959 */
function CardViewLayout({ broker }: { broker: BrokerRebate }) {
  return (
    <article className="flex h-full flex-col gap-8 rounded-lg bg-[#f6f6f6] p-6 dark:bg-[#171f1c]">
      <BrokerIdentity broker={broker} />
      <PaymentMethods text={broker.paymentMethod} />
      <RatesGrid rates={broker.rates} columns="card" />
      <div className="mt-auto flex items-center gap-2">
        <Link
          href="#"
          className="inline-flex h-10 flex-1 items-center justify-center rounded border border-[#0c110f] bg-[#0c110f] px-4 text-sm font-medium text-white hover:bg-[#0c110f]/90 dark:border-white dark:bg-white dark:text-[#0c110f] dark:hover:bg-gray-200"
        >
          Get Rebate
        </Link>
        <Link
          href="#"
          className="inline-flex h-10 shrink-0 items-center justify-center px-2 text-sm font-medium text-[#0c110f] underline-offset-2 hover:underline dark:text-white"
        >
          View details
        </Link>
      </div>
    </article>
  );
}

function ListViewLayout({ broker }: { broker: BrokerRebate }) {
  return (
    <article className="rounded-lg border border-[#f0f0f0] bg-[#f6f6f6] p-4 md:p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <BrokerIdentity broker={broker} />
        <div className="lg:min-w-[247px]">
          <PaymentMethods text={broker.paymentMethod} />
        </div>
        <div className="flex items-center gap-3 lg:justify-end">
          <Link
            href="#"
            className="inline-flex h-8 items-center justify-center rounded px-3 text-sm font-medium text-[#0c110f] underline-offset-2 hover:underline dark:text-gray-100"
          >
            View details
          </Link>
          <Link
            href="#"
            className="inline-flex h-8 items-center justify-center rounded bg-[#0c110f] px-3 text-sm font-medium text-white shadow-[0px_3px_4px_rgba(0,0,0,0.22)] hover:bg-[#0c110f]/90 dark:bg-white dark:text-[#0c110f] dark:hover:bg-gray-200"
          >
            Get Rebate
          </Link>
        </div>
      </div>
      <div className="mt-4 md:mt-5">
        <RatesGrid rates={broker.rates} columns="list" />
      </div>
    </article>
  );
}

export default function BrokerRebateCard({ broker, view }: Props) {
  if (view === "card") {
    return <CardViewLayout broker={broker} />;
  }
  return <ListViewLayout broker={broker} />;
}
