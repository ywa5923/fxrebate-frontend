'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { createUserPermission } from '@/lib/user-permission-requests';

const schema = z.object({
  subject_type: z.literal('PlatformUser'),
  subject_id: z.coerce.number().int().min(1, 'Select a user'),
  permission_type: z.literal('broker'),
  resource_id: z.number().int().optional().nullable(),
  resource_value: z.string().max(255).optional().nullable(),
  action: z.enum(['view', 'edit', 'manage']),
  metadata: z.any().optional().nullable(),
  is_active: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateBrokerPermissionFormProps {
  platformUsers: Array<{ id: number; name: string; email: string }>;
  brokers: Array<{ id: number; trading_name: string }>;
}

export function CreateBrokerPermissionForm({ platformUsers, brokers }: CreateBrokerPermissionFormProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [isPending, startTransition] = useTransition();
  const [selectedBrokerId, setSelectedBrokerId] = useState<number | null>(null);

  const brokerIdToName = useMemo(() => {
    const map = new Map<number, string>();
    brokers.forEach(b => map.set(b.id, b.trading_name));
    return map;
  }, [brokers]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      subject_type: 'PlatformUser',
      subject_id: undefined as unknown as number,
      permission_type: 'broker',
      resource_id: null,
      resource_value: '',
      action: 'view',
      metadata: null,
      is_active: true,
    },
  });

  useEffect(() => {
    if (selectedBrokerId) {
      const name = brokerIdToName.get(selectedBrokerId) || '';
      form.setValue('resource_value', name);
      form.setValue('resource_id', selectedBrokerId);
    } else {
      form.setValue('resource_value', '');
      form.setValue('resource_id', null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrokerId]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const payload = {
        ...values,
        resource_id: selectedBrokerId ?? null,
        resource_value: selectedBrokerId ? (brokerIdToName.get(selectedBrokerId) || '') : '',
      };
      const res = await createUserPermission(payload);
      if (res.success) {
        toast.success('Permission created');
        router.push(`/${locale}/control-panel/super-manager/user-permissions`);
      } else {
        toast.error(res.message || 'Failed to create permission');
      }
    });
  };

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-4">Create Broker Type Permission</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>User Type</Label>
            <Input value="PlatformUser" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject_id">User</Label>
            <UserSearchDropdown
              users={platformUsers}
              value={form.watch('subject_id')}
              onSelect={(id) => form.setValue('subject_id', id)}
            />
          </div>
          <div className="space-y-2">
            <Label>Permission Type</Label>
            <Input value="broker" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="broker">Broker</Label>
            <BrokerSearchDropdown
              brokers={brokers}
              value={selectedBrokerId}
              onSelect={(id) => setSelectedBrokerId(id)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="action">Action</Label>
            <Select onValueChange={(v) => form.setValue('action', v as FormValues['action'])} defaultValue={form.getValues('action')}>
              <SelectTrigger id="action">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">VIEW</SelectItem>
                <SelectItem value="edit">EDIT</SelectItem>
                <SelectItem value="manage">MANAGE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="is_active">Active</Label>
            <div className="flex items-center h-10 px-2 border rounded-md">
              <Switch checked={!!form.watch('is_active')} onCheckedChange={(v) => form.setValue('is_active', v)} />
              <span className="ml-2 text-sm">{form.watch('is_active') ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isPending} className="bg-green-900 hover:bg-green-950 text-white">
            {isPending ? 'Saving...' : 'Create Permission'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}

interface UserOption { id: number; name: string; email: string }
function UserSearchDropdown({ users, value, onSelect }: { users: UserOption[]; value?: number | null; onSelect: (id: number) => void }) {
  const [open, setOpen] = useState(false);
  const selected = users.find(u => u.id === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between h-10">
          {selected ? `${selected.name} (${selected.email})` : 'Select user'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
        <Command>
          <CommandInput placeholder="Search user..." />
          <CommandEmpty>No users found.</CommandEmpty>
          <CommandList>
            {users.map(u => (
              <CommandItem key={u.id} value={`${u.name} ${u.email}`} onSelect={() => { onSelect(u.id); setOpen(false); }} className="flex items-center gap-2">
                <Check className={`h-4 w-4 ${selected?.id === u.id ? 'opacity-100' : 'opacity-0'}`} />
                <span>{u.name}</span>
                <span className="text-xs text-muted-foreground">({u.email})</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface BrokerOption { id: number; trading_name: string }
function BrokerSearchDropdown({ brokers, value, onSelect }: { brokers: BrokerOption[]; value?: number | null; onSelect: (id: number) => void }) {
  const [open, setOpen] = useState(false);
  const selected = brokers.find(b => b.id === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between h-10">
          {selected ? selected.trading_name : 'Select broker'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
        <Command>
          <CommandInput placeholder="Search broker..." />
          <CommandEmpty>No brokers found.</CommandEmpty>
          <CommandList>
            {brokers.map(b => (
              <CommandItem key={b.id} value={b.trading_name} onSelect={() => { onSelect(b.id); setOpen(false); }} className="flex items-center gap-2">
                <Check className={`h-4 w-4 ${selected?.id === b.id ? 'opacity-100' : 'opacity-0'}`} />
                <span>{b.trading_name}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}