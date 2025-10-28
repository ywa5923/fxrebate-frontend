'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { createZone } from '@/lib/zone-requests';
import { zoneSchema } from '@/app/schemas/zone-schema';

// Use the shared schema directly (already includes all validation)
type ZoneFormValues = z.infer<typeof zoneSchema>;

export default function AddZonePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ZoneFormValues>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      name: '',
      zone_code: '',
      description: '',
    },
  });

  function onSubmit(data: ZoneFormValues) {
    startTransition(async () => {
      try {
        const result = await createZone({
          name: data.name,
          zone_code: data.zone_code,
          description: data.description || null,
        });

        if (result.success) {
          toast.success('Zone Added Successfully', {
            description: `Zone "${data.name}" has been added to the system.`,
          });
          form.reset();
          router.push('/en/control-panel/super-manager/zones');
          router.refresh();
        } else {
          toast.error('Error Adding Zone', {
            description: result.message || 'Failed to add zone',
          });
        }
      } catch (error) {
        console.error('Error adding zone:', error);
        toast.error('Error Adding Zone', {
          description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        });
      }
    });
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-0 relative">
      {isPending && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            <p className="text-lg font-medium">Adding Zone...</p>
          </div>
        </div>
      )}
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-xl sm:text-2xl">Add New Zone</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Create a new geographical zone in the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Europe" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs sm:text-sm">
                      The full name of the geographical zone.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zone_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., eu" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                      />
                    </FormControl>
                    <FormDescription className="text-xs sm:text-sm">
                      A unique lowercase code for the zone (e.g., eu, as, us).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter a description for this zone..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs sm:text-sm">
                      Additional information about this zone.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Button 
                  type="submit" 
                  disabled={isPending} 
                  className="bg-green-700 hover:bg-green-800 w-full sm:w-auto h-11 text-base font-medium"
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isPending ? 'Adding Zone...' : 'Add Zone'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/en/control-panel/super-manager/zones')}
                  disabled={isPending}
                  className="w-full sm:w-auto h-11 text-base"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

