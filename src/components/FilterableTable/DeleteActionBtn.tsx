"use client"
import { useState } from "react"
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
import { Trash } from "lucide-react"
import { toast } from "sonner"
import { BASE_URL } from "@/constants"
import { useRouter } from "next/navigation"
export default function DeleteActionBtn( { resourceId, resourcetoDelete, resourceApiUrl }: { resourceId?: number|string, resourcetoDelete?: string, resourceApiUrl?: string } ) {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const handleDelete = async () => {

        let apiUrl=BASE_URL + resourceApiUrl + "/" + resourceId;
        //to do: make an universal server action to delete the resource
        //const res = await deleteResource(resourceId, resourceApiUrl)
        const res = { success: true }
        if (res.success) {
            toast.success(`${resourcetoDelete} deleted successfully`)
            setOpen(false)
            router.refresh()
        } else {
            toast.error(`Failed to delete ${resourcetoDelete}`)
        }
    }
    
    return (
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
                <Button variant="destructive" onClick={() => setOpen(false)}>Delete</Button>
            </DialogFooter>
            </DialogContent>
            
        </Dialog>
    )
}