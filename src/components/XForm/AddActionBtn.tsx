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
import {  PlusIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
export default function AddActionBtn( {  resourceName,addApiUrl }: { resourceName: string,addApiUrl: string } ) {
    const [open, setOpen] = useState(false)

    const handleOpen = () => {
      // if XForm uses react-hook-form internally, expose a reset method later or via key remount
      setOpen(true);
    };
    
  return (
 <Dialog open={open} modal={false} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button
      onClick={handleOpen}
      className="h-8 w-8 p-0 text-blue-700 hover:text-blue-800 hover:bg-blue-50 "
      variant="ghost"
      size="sm"
      title={`Add ${resourceName ?? "item"}`}
    >
      <PlusIcon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
    </Button>
  </DialogTrigger>
  <DialogContent className="max-h-[85vh] p-2 overflow-y-none">
    <DialogHeader className="p-2">
      <DialogTitle>Add {resourceName}</DialogTitle>
      <DialogDescription>
        Add the resource form data.
      </DialogDescription>
    </DialogHeader>
    <ScrollArea className="max-h-[70vh] p-1">
      <XForm
        resourceName={resourceName}
        resourceApiUrl={addApiUrl}
        mode="create"
        onSubmitted={() => setOpen(false)}
      />
    </ScrollArea>
    
  </DialogContent>
 
 </Dialog>
  )
}