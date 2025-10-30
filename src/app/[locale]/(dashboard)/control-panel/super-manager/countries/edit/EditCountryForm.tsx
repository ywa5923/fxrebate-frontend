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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { updateCountry } from '@/lib/country-requests';
import { countrySchema } from '@/app/schemas/country-schema';
import type { Zone, Country } from '@/types';

type CountryFormValues = z.infer<typeof countrySchema>;

interface EditCountryFormProps {
  zones: Zone[];
  country: Country;
}

export function EditCountryForm({ zones, country }: EditCountryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CountryFormValues>({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      name: country.name || '',
      country_code: country.country_code || '',
      zone_id: country.zone?.id || undefined,
    },
  });

  function onSubmit(data: CountryFormValues) {
    startTransition(async () => {
      try {
        const result = await updateCountry(country.id, {
          name: data.name,
          country_code: data.country_code,
          zone_id: data.zone_id,
        });

        if (result.success) {
          toast.success('Country Updated Successfully', {
            description: `Country "${data.name}" has been updated.`,
          });
          router.push('/en/control-panel/super-manager/countries');
          router.refresh();
        } else {
          toast.error('Error Updating Country', {
            description: result.message || 'Failed to update country',
          });
        }
      } catch (error) {
        console.error('Error updating country:', error);
        toast.error('Error Updating Country', {
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
            <p className="text-lg font-medium">Updating Country...</p>
          </div>
        </div>
      )}
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-xl sm:text-2xl">Edit Country</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Update the country information.
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
                    <FormLabel>Country Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Romania" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs sm:text-sm">
                      The full name of the country.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., ro" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                      />
                    </FormControl>
                    <FormDescription className="text-xs sm:text-sm">
                      A unique lowercase code for the country (e.g., ro, us, gb).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zone_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a zone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {zones.map((zone) => (
                          <SelectItem key={zone.id} value={zone.id.toString()}>
                            {zone.name} ({zone.zone_code.toUpperCase()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs sm:text-sm">
                      Select the geographical zone this country belongs to.
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
                  {isPending ? 'Updating Country...' : 'Update Country'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/en/control-panel/super-manager/countries')}
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

