"use client";

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { requestMagicLink } from '@/lib/auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

const schema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
    mode: 'onSubmit',
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const res = await requestMagicLink(values.email);
      if (res.success) {
        toast.success('Check your email', {
          description: res.message ?? 'We sent you a magic link to sign in.',
        });
        setSent(true);
      } else {
        toast.error('Failed to send magic link', {
          description: res.message ?? 'Please try again.',
        });
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-sm border rounded-lg p-6 bg-white">
      <div className="flex justify-center mb-6">
        <Image src="/assets/darkFxRebate-logo.svg" alt="FxRebate" width={200} height={40} />
      </div>
      {!sent ? (
        <>
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold">Welcome back</h1>
            <p className="text-sm text-gray-600">Enter your email to receive a magic link.</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormControl>
                      <Input id="email" type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-green-900 hover:bg-green-950" disabled={isPending}>
                {isPending ? 'Sending…' : 'Send my magic link'}
              </Button>
            </form>
          </Form>
        </>
      ) : (
        <div className="text-center space-y-3">
          <h2 className="text-lg font-semibold">Check your email</h2>
          <p className="text-sm text-gray-600">
            We sent a magic sign-in link to <span className="font-medium">{form.getValues('email')}</span>.
          </p>
          <p className="text-xs text-gray-500">You can close this window now.</p>
        </div>
      )}
    </div>
  );
}


