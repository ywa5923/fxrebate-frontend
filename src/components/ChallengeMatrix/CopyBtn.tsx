"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { FiCopy } from "react-icons/fi";

export default function CopyBtn({
  isGreen,
  onClick,
  title = "Copy broker value to public value",
}: {
  isGreen: boolean;
  onClick: () => void;
  title?: string;
}) {
  const [seen, setSeen] = useState(false);

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        className={cn(
          "p-2 flex-shrink-0 bg-red-100 border-red-500 text-red-700",
          {
            "bg-green-100 border-green-500 text-green-700": isGreen,
          },
        )}
        title={title}
      >
        <FiCopy className="w-4 h-4" />
      </Button>
      <Checkbox
        checked={seen}
        onCheckedChange={(checked) => setSeen(checked === true)}
        aria-label="Mark as seen"
        title="Mark as seen"
        className="data-[state=checked]:bg-green-700 data-[state=checked]:border-green-800 data-[state=checked]:text-green-50 dark:data-[state=checked]:bg-green-700"
      />
    </div>
  );
}
