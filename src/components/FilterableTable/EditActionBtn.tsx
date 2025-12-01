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
import { useState } from "react"
import { XFormDefinition } from "@/types"
import { PencilIcon, PlusIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
export default function EditActionBtn( { getItemUrl, updateItemUrl, formConfig,resourceId,resourceName,resourceApiUrl }: { getItemUrl?: string, updateItemUrl?: string, formConfig: XFormDefinition,resourceId?: number|string,resourceName?: string,resourceApiUrl?: string } ) {
    const [open, setOpen] = useState(false)
        
  return (
 <Dialog open={open} modal={false} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button
      onClick={() => setOpen(true)}
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
      <XForm getItemUrl={getItemUrl} updateItemUrl={updateItemUrl} formConfig={formConfig} resourceId={resourceId} resourceName={resourceName}  />
    </ScrollArea>
    
  </DialogContent>
 
 </Dialog>
  )
}