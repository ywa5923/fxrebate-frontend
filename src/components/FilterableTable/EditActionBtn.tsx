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

interface EditActionBtnProps {
  getItemUrl: string;
  updateItemUrl: string;
  formConfig: XFormDefinition;
  resourceId: number|string;
  resourceName?: string;
}
export default function EditActionBtn( { getItemUrl, updateItemUrl, formConfig,resourceId,resourceName}: EditActionBtnProps ) {
    const [open, setOpen] = useState(false)

    useEffect(() => {
      console.log(`🟢 EditActionBtn mounted`);
      return () => {
        console.log(`🔴 EditActionBtn unmounted`);
      };
    }, []);
        
  return (
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button
      type="button"
      onClick={(e) => { e.stopPropagation(); setOpen(true); }}
      onPointerDown={(e) => e.stopPropagation()}
      className="h-8 w-8 p-0 text-blue-700 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 rounded-md"
      variant="ghost"
      size="sm"
      title={`Edit ${resourceName ?? "item"}`}
    >
      <PencilIcon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
    </Button>
  </DialogTrigger>
  <DialogContent className="max-h-[85vh] p-2 overflow-y-none">   
 
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
        onSubmitted={() => {
          console.log('⚠️ onSubmitted was called!');
          setTimeout(() => {
            setOpen(false);
          }, 2000); // Wait 5 seconds
        }}
      />
    </ScrollArea>
    
  </DialogContent>
 
 </Dialog>
  )
}