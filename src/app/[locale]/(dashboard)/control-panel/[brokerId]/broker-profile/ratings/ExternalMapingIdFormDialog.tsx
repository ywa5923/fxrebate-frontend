"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
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
import type { XFormDefinition } from "@/types";

const formConfig: XFormDefinition = {
  sections: {
    external_mapping: {
      label: "External Mapping",
      fields: {
        external_mapping_id: {
          type: "number",
          label: "External Mapping ID",
          placeholder: "External ID",
          required: true,
          validation: {
            required: true,
            min: 1,
            max: Number.MAX_SAFE_INTEGER,
          },
        },
      },
    },
  },
};

export default function ExternalMapingIdFormDialog({ brokerId }: { brokerId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="icon" aria-label="External mapping ID">
                <Link2 aria-hidden="true" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>External mapping ID</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent aria-describedby={undefined} className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader className="border-b pb-4 pr-6">
          <DialogTitle className="flex items-center gap-2 text-left">
            <Link2 className="size-5 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden="true" />
            External Mapping ID
          </DialogTitle>
        </DialogHeader>
        {open && (
          <div className="[&>div]:m-0 [&_[data-slot=field-set]]:border-0 [&_[data-slot=field-set]]:p-0 [&_[data-slot=field-legend]]:sr-only [&_[data-slot=field-description]:empty]:hidden">
            <XForm
              key={brokerId}
              formConfig={formConfig}
              getItemUrl={`/brokers/${encodeURIComponent(brokerId)}/external-mapping-id`}
              resourceApiUrl={`/brokers/${encodeURIComponent(brokerId)}/external-mapping-id`}
              resourceName="External Mapping ID"
              mode="edit"
              onSubmitted={() => setOpen(false)}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
