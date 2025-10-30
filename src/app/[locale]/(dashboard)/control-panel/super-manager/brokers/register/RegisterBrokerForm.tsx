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
import { registerBroker } from '@/lib/broker-requests';
import { registerBrokerSchema } from '@/app/schemas/broker-schema';
import type { BrokerType } from '@/types/Broker';
import type { Country } from '@/types';

type RegisterBrokerValues = z.infer<typeof registerBrokerSchema>;

interface RegisterBrokerFormProps {
  brokerTypes: BrokerType[];
  countries: { id: number; name: string }[];
}

export function RegisterBrokerForm({ brokerTypes, countries }: RegisterBrokerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<RegisterBrokerValues>({
    resolver: zodResolver(registerBrokerSchema),
    defaultValues: {
      broker_type_id: undefined as unknown as number,
      email: '',
      trading_name: '',
      country_id: undefined as unknown as number,
    },
  });

  function onSubmit(values: RegisterBrokerValues) {
    startTransition(async () => {
      const res = await registerBroker(values);
      if (res.success) {
        toast.success('Broker registered successfully');
        form.reset();
        router.push('/en/control-panel/super-manager/brokers');
        router.refresh();
      } else {
        toast.error('Failed to register broker', { description: res.message });
      }
    });
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-0 relative">
      {isPending && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            <p className="text-lg font-medium">Registering Broker...</p>
          </div>
        </div>
      )}
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-xl sm:text-2xl">Register Broker</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Create a new broker entry.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="broker_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Broker Type</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      defaultValue={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a broker type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brokerTypes.map((bt) => (
                          <SelectItem key={bt.id} value={String(bt.id)}>
                            {bt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="broker@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trading_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trading Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Trading Ltd" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      defaultValue={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button type="submit" disabled={isPending}>
                  Register
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}


