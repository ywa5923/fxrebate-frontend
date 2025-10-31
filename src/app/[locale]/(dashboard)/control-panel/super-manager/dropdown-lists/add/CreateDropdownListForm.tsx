'use client';

import { useState, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { createDropdownList } from '@/lib/dropdown-list-requests';
import { toast } from 'sonner';

interface OptionRow {
  label: string;
  value: string;
  valueAuto?: boolean;
}

export default function CreateDropdownListForm() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [isPending, startTransition] = useTransition();

  const [listName, setListName] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<OptionRow[]>([
    { label: '', value: '', valueAuto: true },
  ]);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const addOption = () => setOptions((prev) => [...prev, { label: '', value: '', valueAuto: true }]);
  const removeOption = (index: number) => setOptions((prev) => prev.filter((_, i) => i !== index));
  const updateOption = (index: number, field: 'label' | 'value', value: string) => {
    setOptions((prev) => prev.map((opt, i) => {
      if (i !== index) return opt;
      if (field === 'label') {
        const nextLabel = value;
        const nextValue = opt.valueAuto || !opt.value ? slugify(nextLabel) : opt.value;
        return {
          ...opt,
          label: nextLabel,
          value: nextValue,
        };
      }
      if (field === 'value') {
        return { ...opt, value, valueAuto: value.trim().length === 0 };
      }
      return { ...opt, [field]: value } as OptionRow;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedOptions = options
      .filter(o => o.label.trim() && o.value.trim())
      .map(o => ({ label: o.label.trim(), value: o.value.trim() }));
    if (!listName.trim()) {
      toast.error('Please provide a list name');
      return;
    }
    if (cleanedOptions.length === 0) {
      toast.error('Please add at least one option');
      return;
    }
    startTransition(async () => {
      const res = await createDropdownList(listName.trim(), description.trim() || null, cleanedOptions);
      if (res.success) {
        toast.success('List created');
        router.push(`/${locale}/control-panel/super-manager/dropdown-lists`);
        router.refresh();
      } else {
        toast.error('Failed to create list', { description: res.message });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="list_name">List Name</Label>
          <Input id="list_name" value={listName} onChange={(e) => setListName(e.target.value)} placeholder="e.g., Account Types" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Available account types" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Options</Label>
          <Button type="button" variant="outline" size="sm" onClick={addOption} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Option
          </Button>
        </div>
        <div className="space-y-3">
          {options.map((opt, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-center">
              <Input placeholder="Label" value={opt.label} onChange={(e) => updateOption(idx, 'label', e.target.value)} />
              <Input placeholder="Value" value={opt.value} onChange={(e) => updateOption(idx, 'value', e.target.value)} />
              <Button type="button" variant="ghost" className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => removeOption(idx)} title="Remove">
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} className="bg-green-900 hover:bg-green-950">
          Create List
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}



