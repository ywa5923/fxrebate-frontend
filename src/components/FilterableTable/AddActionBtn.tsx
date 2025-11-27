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
import { XFormDefinition } from "@/components/XForm"
import { PencilIcon, PlusIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
export default function AddActionBtn( { formDefinition,resourceId,resourceName,resourceApiUrl }: { formDefinition: XFormDefinition,resourceId?: number|string,resourceName?: string,resourceApiUrl?: string } ) {
    const [open, setOpen] = useState(false)
        
  return (
 <Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button onClick={() => setOpen(true)}>
      {resourceId ? <PencilIcon /> : (<><PlusIcon /> Add new {resourceName}</>)}
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
      <XForm  formDefinition={formDefinition} />
    </ScrollArea>
    
  </DialogContent>
 
 </Dialog>
  )
}