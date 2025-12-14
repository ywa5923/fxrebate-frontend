import { apiClient } from "@/lib/api-client";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ToggleRight, ToggleLeft } from "lucide-react";
import { Broker } from "@/lib/broker-management";
import { useRouter } from "next/navigation";


export default function ToggleActiveBtn({ url,broker }: { url: string,broker: Broker }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
  
    const handleToggle = () => {
      startTransition(async () => {
        try {
          const result = await apiClient(url, true, {
            method: 'PATCH',
          });
          if (result.success) {
            toast.success('Broker status updated successfully');
            router.refresh();
          } else {
            toast.error(result.message || 'Failed to update broker status');
          }
        } catch (error) {
          toast.error('An error occurred while updating broker status');
        }
      });
    };
    
    return (
      <>
        {isPending && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
              <p className="text-lg font-medium">Updating Broker Status...</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={`h-9 w-9 p-0 ${broker.is_active ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
          onClick={handleToggle}
          disabled={isPending}
          title={broker.is_active ? 'Deactivate broker' : 'Activate broker'}
        >
          {broker.is_active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
        </Button>
      </>
    );
  }