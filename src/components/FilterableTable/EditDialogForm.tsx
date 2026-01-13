"use client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import { Button } from "@/components/ui/button"
  import XForm from "@/components/XForm/XForm"
import { useEffect, useState } from "react"
import { XFormDefinition } from "@/types"
import { PencilIcon, PlusIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"

interface EditActionBtnProps {
  open: boolean;
  onOpenClose: () => void;
  getItemUrl: string;
  updateItemUrl: string;
  formConfig: XFormDefinition;
  resourceId: number|string;
  resourceName?: string;
}
export default function EditDialogForm( { open, onOpenClose, getItemUrl, updateItemUrl, formConfig,resourceId,resourceName}: EditActionBtnProps ) {
  
const router = useRouter();

const onSubmitted = () => {
  onOpenClose();
  router.refresh();
}

    useEffect(() => {
      console.log(`🟢 EditActionBtn mounted`);
      return () => {
        console.log(`🔴 EditActionBtn unmounted`);
      };
    }, []);
        
  return (
<Dialog open={open} onOpenChange={onOpenClose}>
 
  <DialogContent className="max-h-[85vh] p-2 overflow-y-none"   
  onInteractOutside={(e) => e.preventDefault()}
  onPointerDownOutside={(e) => e.preventDefault()}>
    <DialogHeader className="p-2">
      <DialogTitle>Edit {resourceName}</DialogTitle>
      <DialogDescription>
        Edit the resource form data.
      </DialogDescription>
    </DialogHeader>
    <ScrollArea className="max-h-[70vh] p-1">
         
      <XForm 
        getItemUrl={getItemUrl} 
        resourceApiUrl={updateItemUrl} 
        formConfig={formConfig} 
        resourceId={resourceId} 
        resourceName={resourceName} 
        mode="edit" 
        onSubmitted={onSubmitted}
      />
    </ScrollArea>
    
  </DialogContent>
 
 </Dialog>
  )
}