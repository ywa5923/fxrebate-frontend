import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area";
import XForm, { preventCloseOnPortalClick } from "@/components/XForm";

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
        <DialogContent className="max-h-[85vh] p-2 overflow-y-hidden"
        onPointerDownOutside={preventCloseOnPortalClick}
        onInteractOutside={preventCloseOnPortalClick}
        >
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
      