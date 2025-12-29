import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import { ScrollArea } from "@/components/ui/scroll-area";
import XForm from "./XForm";

export default function DialogAddBtn({
    formConfigApiUrl,
    resourceName,
    addApiUrl,
    open,
    onOpenClose,
  }: {
    formConfigApiUrl: string;
    resourceName: string;
    addApiUrl: string;
    open: boolean;
    onOpenClose: () => void;
  }) {
    return (
      <Dialog open={open} onOpenChange={onOpenClose}>
        <DialogContent className="max-h-[85vh] p-2 overflow-y-hidden">
          <DialogHeader className="p-2">
            <DialogTitle>Add {resourceName}</DialogTitle>
            <DialogDescription>Add the resource form data.</DialogDescription>
          </DialogHeader>
  
          <ScrollArea className="max-h-[70vh] p-1">
            <XForm
              resourceName={resourceName}
              resourceApiUrl={addApiUrl}
              formConfigApiUrl={formConfigApiUrl}
              mode="create"
              onSubmitted={() => onOpenClose()}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }
      