"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import ChallengeTabForm from "./ChallengeTabForm";
import { ChallengeType } from "@/types";


export default function AddTabBtn({
  tabType,
  categories,
  defaultCategories,
  addApiUrl,
}: {
  tabType: string;
  categories: ChallengeType[];
  defaultCategories?: ChallengeType[];
  addApiUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  
  //categories list are shown in the form select box
  //for tabType=category,the categories received in props are the categories that are not in the broker categories list
  //for tabType=step and amount, the categories received in props are the categories that are in the broker categories list
  

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };
    
  return (
 <Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button
      variant="ghost"
      size="sm"
      title={`Add ${tabType ?? "item"}`}
      className="inline-flex items-center justify-center gap-1 h-6 min-w-[1.5rem] px-1.5 rounded-full bg-slate-200 text-slate-700 shadow hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-500 focus-visible:ring-offset-2 transition-colors"
    >
      <PlusIcon className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden="true" />
      <span className="hidden sm:inline text-xs font-medium">Add {tabType}</span>
    </Button>
  </DialogTrigger>
  <DialogContent className="max-h-[85vh] p-2 overflow-y-none">
    <DialogHeader className="p-2">
      <DialogTitle>Add {tabType}</DialogTitle>
      <DialogDescription>
        Add the tab data.
      </DialogDescription>
    </DialogHeader>
    <ScrollArea className="max-h-[70vh] p-1">
      <ChallengeTabForm
        tabType={tabType}
        categories={categories}
        defaultCategories={defaultCategories ?? []}
        addApiUrl={addApiUrl}
        onSuccess={handleSuccess}
      />
    </ScrollArea>
    
  </DialogContent>
 
 </Dialog>
  )
}