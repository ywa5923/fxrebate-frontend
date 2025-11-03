"use client";

import { useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

const optionSchema = z.object({
  label: z.string().trim().min(1, 'Label is required'),
  value: z.string().trim().min(1, 'Value is required'),
});

const formSchema = z.object({
  list_name: z.string().trim().min(1, 'List name is required'),
  description: z.string().trim().optional().nullable(),
  options: z.array(optionSchema).min(1, 'Add at least one option'),
});

type FormValues = z.infer<typeof formSchema>;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

interface DropdownListFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmitHandler: (
    list_name: string,
    description: string | null,
    options: Array<{ label: string; value: string }>
  ) => Promise<{ success: boolean; message?: string }>;
  submitButtonText?: string;
}

export default function DropdownListForm({ 
  defaultValues,
  onSubmitHandler,
  submitButtonText = 'Create List'
}: DropdownListFormProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      list_name: '',
      description: '',
      options: [{ label: '', value: '' }],
    },
    mode: 'onSubmit',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    startTransition(async () => {
      // Clean values
      const cleanedOptions = values.options
        .filter((o) => o.label.trim() && o.value.trim())
        .map((o) => ({ label: o.label.trim(), value: o.value.trim() }));

      const list_name = values.list_name.trim();
      const description = values.description && values.description.trim() ? values.description.trim() : null;

      // Call handler with individual parameters
      const result = await onSubmitHandler(list_name, description, cleanedOptions);
      
      // Handle toast messages
      if (result?.success) {
        const message = submitButtonText === 'Update List' ? 'List updated' : 'List created';
        toast.success(message);
        router.push(`/${locale}/control-panel/super-manager/dropdown-lists`);
        router.refresh();
      } else if (result && !result.success) {
        const errorMessage = submitButtonText === 'Update List' 
          ? 'Failed to update list' 
          : 'Failed to create list';
        toast.error(errorMessage, { description: result.message });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control as any}
            name="list_name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="list_name">List Name</FormLabel>
                <FormControl>
                  <Input id="list_name" placeholder="e.g., Account Types" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control as any}
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="description">Description</FormLabel>
                <FormControl>
                  <Input id="description" placeholder="e.g., Available account types" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>Options</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ label: '', value: '' })}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Option
            </Button>
          </div>
          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div key={field.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-center">
                <FormField
                  control={form.control as any}
                  name={`options.${idx}.label` as const}
                  render={({ field: labelField }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Label"
                          {...labelField}
                          onChange={(e) => {
                            const nextLabel = e.target.value;


                            form.setValue(`options.${idx}.value`, slugify(nextLabel), { 
                              shouldDirty: true, 
                              shouldValidate: true 
                            });
                            
                            // const currentValue = form.getValues(`options.${idx}.value`);
                            // if (!currentValue) {
                              
                            // }

                            labelField.onChange(nextLabel);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name={`options.${idx}.value` as const}
                  render={({ field: valueField }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Value"
                          {...valueField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => remove(idx)}
                  title="Remove"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isPending} className="bg-green-900 hover:bg-green-950">
            {submitButtonText}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}



