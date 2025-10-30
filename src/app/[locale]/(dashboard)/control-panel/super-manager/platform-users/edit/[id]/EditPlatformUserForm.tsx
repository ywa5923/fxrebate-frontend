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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { platformUserSchema, platformUserRoles } from '@/app/schemas/platform-user-schema';
import { updatePlatformUser } from '@/lib/platform-user-requests';

type FormValues = z.infer<typeof platformUserSchema>;

interface EditPlatformUserFormProps {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
  };
}

export function EditPlatformUserForm({ user }: EditPlatformUserFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(platformUserSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: (user?.role as any) || undefined,
      is_active: user?.is_active ?? true,
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const res = await updatePlatformUser(user.id, values);
      if (res.success) {
        toast.success('Platform user updated');
        router.push('/en/control-panel/super-manager/platform-users');
        router.refresh();
      } else {
        toast.error('Failed to update platform user', { description: res.message });
      }
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-0 relative">
      {isPending && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            <p className="text-lg font-medium">Saving...</p>
          </div>
        </div>
      )}
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-xl sm:text-2xl">Edit Platform User</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Update platform user details.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
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
                      <Input type="email" placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={(v) => field.onChange(v)} defaultValue={field.value as string | undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {platformUserRoles.map((r) => {
                          const label = r.replace(/_/g, ' ').toUpperCase();
                          return (
                            <SelectItem key={r} value={r}>{label}</SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={(v) => field.onChange(v === 'true')} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button type="submit" disabled={isPending}>Save Changes</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}


