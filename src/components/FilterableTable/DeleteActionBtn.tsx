"use client"
import { useState, useTransition } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Trash } from "lucide-react"
import { toast } from "sonner"

import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
export default function DeleteActionBtn( { deleteUrl, resourceId, resourcetoDelete }: { deleteUrl?: string, resourceId?: number|string, resourcetoDelete?: string} ) {
    
    const [isPending, startTransition] = useTransition();
    
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const handleDelete = async () => {

        let apiUrl=deleteUrl + "/" + resourceId;
        startTransition(async () => {
            try {
                console.log("apiUrl", apiUrl);
              const result = await apiClient(apiUrl, true, {
                method: 'DELETE',
              });
              console.log("result", result);
              if (result.success) {
                toast.success(`${resourcetoDelete} deleted successfully`);
                router.refresh();
              } else {
                toast.error(result.message || `Failed to delete ${resourcetoDelete}`);
              }
            } catch (error) {
              toast.error(`An error occurred while deleting ${resourcetoDelete}`);
            }
          });



    }
    
    return (
        <>
       
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    onClick={() => setOpen(true)}
                    className="h-8 w-8 p-0 text-red-700 hover:text-red-800 hover:bg-red-50 border border-red-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                    variant="ghost"
                    size="sm"
                    title={`Delete ${resourcetoDelete ?? "item"}`}
                    aria-label={`Delete ${resourcetoDelete ?? "item"}`}
                >
                    <Trash className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete {resourcetoDelete}</DialogTitle>
                    <DialogDescription>
                    Are you sure you want to delete "{resourcetoDelete}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
            </DialogFooter>
            </DialogContent>
            
        </Dialog>
        </>
    )
}