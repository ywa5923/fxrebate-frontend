"use client";

import { useState } from "react";
import { Plus, Star } from "lucide-react";
import XForm from "@/components/XForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function BrokerRatingsFormDialog({ brokerId }: { brokerId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="icon" aria-label="Add or edit ratings">
                <Plus aria-hidden="true" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Add or edit ratings</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent aria-describedby={undefined} className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader className="border-b pb-4 pr-6">
          <DialogTitle className="flex items-center gap-2 text-left">
            <Star className="size-5 shrink-0 fill-yellow-400 text-yellow-500" aria-hidden="true" />
            Broker Ratings
          </DialogTitle>
        </DialogHeader>
        {open && (
          <div
            className="[&>div]:m-0 [&_[data-slot=field-set]]:border-0 [&_[data-slot=field-set]]:p-0 [&_[data-slot=field-legend]]:sr-only [&_[data-slot=field-description]:empty]:hidden [&_[data-slot=field-group]]:gap-5 [&_[data-slot=field]]:grid [&_[data-slot=field]]:grid-cols-[minmax(0,1fr)_7rem] [&_[data-slot=field]]:items-center [&_[data-slot=field-error]]:col-span-2"
            onFocusCapture={(event) => {
              // Keep decimal input steps scoped to the ratings form.
              event.currentTarget.querySelectorAll<HTMLInputElement>('input[type="number"]').forEach((input) => {
                input.step = "any";
              });
            }}
          >
            <XForm
              key={brokerId}
              formConfigApiUrl="/ratings/form-config"
              getItemUrl={`/ratings/${encodeURIComponent(brokerId)}`}
              resourceApiUrl={`/ratings/${encodeURIComponent(brokerId)}`}
              resourceName="Ratings"
              mode="edit"
              onSubmitted={() => setOpen(false)}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
