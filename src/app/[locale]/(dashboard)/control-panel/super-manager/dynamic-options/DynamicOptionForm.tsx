"use client";

import { useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import type { OptionCategory, FormMetaData, DynamicOptionForm as DynamicOptionFormType } from '@/types/DynamicOption';
import type { DropdownList } from '@/types/DropdownList';
import type { DynamicOption } from '@/types/DynamicOption';

const formSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  slug: z.string().trim().min(1, 'Slug is required'),
  applicable_for: z.string().trim().min(1, 'Applicable For is required'),
  data_type: z.string().trim().min(1, 'Data Type is required'),
  form_type: z.string().trim().min(1, 'Form Type is required'),
  meta_data: z.string().trim().optional().nullable(),
  for_crypto: z.boolean().default(false),
  for_brokers: z.boolean().default(false),
  for_props: z.boolean().default(false),
  required: z.boolean().default(false),
  placeholder: z.string().trim().optional().nullable(),
  tooltip: z.string().trim().optional().nullable(),
  min_constraint: z.string().trim().optional().nullable(),
  max_constraint: z.string().trim().optional().nullable(),
  load_in_dropdown: z.boolean().nullable().default(null),
  default_loading: z.boolean().nullable().default(null),
  default_loading_position: z.number().nullable().default(null),
  dropdown_position: z.number().nullable().default(null),
  position_in_category: z.number().nullable().default(null),
  is_active: z.boolean().nullable().default(null),
  allow_sorting: z.boolean().nullable().default(null),
  //category_name: z.number().nullable().default(null),
  category_name: z.number(),
  dropdown_list_attached: z.number().nullable().default(null),
});

type FormValues = z.infer<typeof formSchema>;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
}

interface DynamicOptionFormProps {
  defaultValues?: DynamicOption;
  onSubmitHandler: (input: DynamicOptionFormType) => Promise<{ success: boolean; message?: string }>;
  submitButtonText?: string;
  dropdownLists: DropdownList[];
  optionCategories: OptionCategory[];
  formMetaData: FormMetaData | null;
}

export default function DynamicOptionForm({
  defaultValues,
  onSubmitHandler,
  submitButtonText = 'Create Dynamic Option',
  dropdownLists,
  optionCategories,
  formMetaData,
}: DynamicOptionFormProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [isPending, startTransition] = useTransition();

  
  let categoryId=optionCategories.find(category => category.name === defaultValues?.category_name)?.id ?? optionCategories[0].id;
  
  let dropdownListId=dropdownLists.find(list => list.name === defaultValues?.dropdown_list_attached)?.id ?? null;
  // Convert DynamicOption (or undefined) to complete FormValues in one pass
  const formDefaultValues = {
    name: defaultValues?.name ?? '',
    slug: defaultValues?.slug ?? '',
    applicable_for: defaultValues?.applicable_for ?? '',
    data_type: defaultValues?.data_type ?? '',
    form_type: defaultValues?.form_type ?? '',
    meta_data: defaultValues?.meta_data ?? null,
    for_crypto: defaultValues?.for_crypto === 1 || defaultValues?.for_crypto === true,
    for_brokers: defaultValues?.for_brokers === 1 || defaultValues?.for_brokers === true,
    for_props: defaultValues?.for_props === 1 || defaultValues?.for_props === true,
    required: defaultValues?.required === 1 || defaultValues?.required === true,
    placeholder: defaultValues?.placeholder ?? null,
    tooltip: defaultValues?.tooltip ?? null,
    min_constraint: defaultValues?.min_constraint != null ? String(defaultValues.min_constraint) : null,
    max_constraint: defaultValues?.max_constraint != null ? String(defaultValues.max_constraint) : null,
    load_in_dropdown: defaultValues?.load_in_dropdown === 1 || defaultValues?.load_in_dropdown === true ? true : null,
    default_loading: defaultValues?.default_loading === 1 || defaultValues?.default_loading === true ? true : (defaultValues?.default_loading === 0 || defaultValues?.default_loading === false ? false : null),
    default_loading_position: defaultValues?.default_loading_position ?? null,
    dropdown_position: defaultValues?.dropdown_position ?? null,
    position_in_category: defaultValues?.position_in_category ?? null,
    is_active: defaultValues?.is_active === 1 || defaultValues?.is_active === true ? true : (defaultValues?.is_active === 0 || defaultValues?.is_active === false ? false : null),
    allow_sorting: defaultValues?.allow_sorting === 1 || defaultValues?.allow_sorting === true ? true : (defaultValues?.allow_sorting === 0 || defaultValues?.allow_sorting === false ? false : null),
    category_name: categoryId,
    dropdown_list_attached: dropdownListId,
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: formDefaultValues,
    mode: 'onSubmit',
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    startTransition(async () => {
      // Clean and transform values
      const formData: DynamicOptionFormType = {
        name: values.name.trim(),
        slug: values.slug.trim(),
        applicable_for: values.applicable_for.trim(),
        data_type: values.data_type.trim(),
        form_type: values.form_type.trim(),
        meta_data: values.meta_data?.trim() || null,
        for_crypto: values.for_crypto ? 1 : 0,
        for_brokers: values.for_brokers ? 1 : 0,
        for_props: values.for_props ? 1 : 0,
        required: values.required ? 1 : 0,
        placeholder: values.placeholder?.trim() || null,
        tooltip: values.tooltip?.trim() || null,
        min_constraint: values.min_constraint?.trim() || null,
        max_constraint: values.max_constraint?.trim() || null,
        load_in_dropdown: values.load_in_dropdown === true ? 1 : 0,
        default_loading: values.default_loading === true ? 1 : (values.default_loading === false ? 0 : null),
        default_loading_position: values.default_loading_position || 0,
        dropdown_position: values.dropdown_position || 0,
        position_in_category: values.position_in_category || 0,
        is_active: values.is_active === true ? 1 : (values.is_active === false ? 0 : null),
        allow_sorting: values.allow_sorting === true ? 1 : 0,
        category_name: values.category_name ?? null,
        dropdown_list_attached: values.dropdown_list_attached ?? null,
      };

     
      const result = await onSubmitHandler(formData);

      // Handle toast messages
      if (result?.success) {
        const message = submitButtonText.includes('Update') ? 'Dynamic option updated' : 'Dynamic option created';
        toast.success(message);
        router.push(`/${locale}/control-panel/super-manager/dynamic-options`);
        router.refresh();
      } else if (result && !result.success) {
        const errorMessage = typeof result.message === 'string' ? result.message : JSON.stringify(result.message || 'Unknown error');
        const action = submitButtonText.includes('Update') ? 'update' : 'create';
        toast.error(`Failed to ${action} dynamic option`, { description: errorMessage });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Required Fields Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Required Fields</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="name">Name *</FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      placeholder="e.g., Trading Name"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value);
                        // Auto-generate slug from name
                        form.setValue('slug', slugify(value), { shouldDirty: true });
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="slug">Slug *</FormLabel>
                  <FormControl>
                    <Input
                      id="slug"
                      placeholder="e.g., trading_name"
                      {...field}
                      onChange={(e) => {
                        field.onChange(slugify(e.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Applicability Section */}
        <div className="space-y-4 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold">Applicability</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="applicable_for"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="applicable_for">Select Dynamic Table *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!formMetaData}
                  >
                    <FormControl>
                      <SelectTrigger id="applicable_for">
                        <SelectValue placeholder={!formMetaData ? 'Loading...' : 'Select dynamic table'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formMetaData?.applicable_for?.map((value, index) => (
                        <SelectItem key={value || index} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-6">
              <FormField
                control={form.control}
                name="for_brokers"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        id="for_brokers"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel htmlFor="for_brokers" className="!mt-0 cursor-pointer">For Brokers</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="for_crypto"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        id="for_crypto"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel htmlFor="for_crypto" className="!mt-0 cursor-pointer">For Crypto</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="for_props"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        id="for_props"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel htmlFor="for_props" className="!mt-0 cursor-pointer">For Props</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Form View Section */}
        <div className="space-y-4 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold">Form View Section</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="data_type"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="data_type">Data Type *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!formMetaData}
                  >
                    <FormControl>
                      <SelectTrigger id="data_type">
                        <SelectValue placeholder={!formMetaData ? 'Loading...' : 'Select data type'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formMetaData?.data_type?.map((value, index) => (
                        <SelectItem key={value || index} value={value}>
                          {value}
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
              name="form_type"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="form_type">Form Type *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!formMetaData}
                  >
                    <FormControl>
                      <SelectTrigger id="form_type">
                        <SelectValue placeholder={!formMetaData ? 'Loading...' : 'Select form type'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formMetaData?.form_type?.map((value, index) => (
                        <SelectItem key={value || index} value={value}>
                          {value}
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
              name="placeholder"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="placeholder">Placeholder</FormLabel>
                  <FormControl>
                    <Input
                      id="placeholder"
                      placeholder="e.g., Enter trading name"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tooltip"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="tooltip">Tooltip</FormLabel>
                  <FormControl>
                    <Input
                      id="tooltip"
                      placeholder="Help text for users"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="min_constraint"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="min_constraint">Min Constraint</FormLabel>
                  <FormControl>
                    <Input
                      id="min_constraint"
                      type="number"
                      placeholder="Minimum value"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="max_constraint"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="max_constraint">Max Constraint</FormLabel>
                  <FormControl>
                    <Input
                      id="max_constraint"
                      type="number"
                      placeholder="Maximum value"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="required"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      id="required"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel htmlFor="required" className="!mt-0 cursor-pointer">Required</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dropdown_list_attached"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="dropdown_list_attached">Dropdown List Attached</FormLabel>
                  <Select
                    value={field.value ? field.value.toString() : 'any'}
                    onValueChange={(value) => field.onChange(value === 'any' ? null : parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger id="dropdown_list_attached">
                        <SelectValue placeholder="Select dropdown list" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="any">None</SelectItem>
                      {dropdownLists.map((list) => (
                        <SelectItem key={list.id} value={list.id.toString()}>
                          {list.name}
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
              name="meta_data"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="meta_data">Meta Data</FormLabel>
                  <FormControl>
                    <Textarea
                      id="meta_data"
                      placeholder="JSON string or additional data"
                      rows={3}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      id="is_active"
                      checked={field.value === true}
                      onCheckedChange={(checked) => field.onChange(checked === true ? true : checked === false ? false : null)}
                    />
                  </FormControl>
                  <FormLabel htmlFor="is_active" className="!mt-0 cursor-pointer">Is Active</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Category Section */}
        <div className="space-y-4 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold">Category Section</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category_name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="category_name">Category Name *</FormLabel>
                  <Select
                    value={field.value ? field.value.toString() : 'any'}
                    onValueChange={(value) => field.onChange(value === 'any' ? null : parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger id="category_name">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="any">None</SelectItem>
                      {optionCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
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
              name="position_in_category"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="position_in_category">Position in Category</FormLabel>
                  <FormControl>
                    <Input
                      id="position_in_category"
                      type="number"
                      min="1"
                      placeholder="Position"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Brokers Table Settings */}
        <div className="space-y-4 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold">Brokers Table Settings</h3>
          <div className="flex items-center gap-6 flex-wrap">
            <FormField
              control={form.control}
              name="allow_sorting"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      id="allow_sorting"
                      checked={field.value === true}
                      onCheckedChange={(checked) => field.onChange(checked === true ? true : checked === false ? false : null)}
                    />
                  </FormControl>
                  <FormLabel htmlFor="allow_sorting" className="!mt-0 cursor-pointer">Allow Sorting</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="load_in_dropdown"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      id="load_in_dropdown"
                      checked={field.value === true}
                      onCheckedChange={(checked) => field.onChange(checked === true ? true : checked === false ? false : null)}
                    />
                  </FormControl>
                  <FormLabel htmlFor="load_in_dropdown" className="!mt-0 cursor-pointer">Load in Dropdown</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dropdown_position"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormLabel htmlFor="dropdown_position" className="whitespace-nowrap">Dropdown Position</FormLabel>
                  <FormControl>
                    <Input
                      id="dropdown_position"
                      type="number"
                      min="1"
                      placeholder="Position"
                      className="w-24"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="default_loading"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      id="default_loading"
                      checked={field.value === true}
                      onCheckedChange={(checked) => field.onChange(checked === true ? true : checked === false ? false : null)}
                    />
                  </FormControl>
                  <FormLabel htmlFor="default_loading" className="!mt-0 cursor-pointer">Default Loading</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="default_loading_position"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormLabel htmlFor="default_loading_position" className="whitespace-nowrap">Default Loading Position</FormLabel>
                  <FormControl>
                    <Input
                      id="default_loading_position"
                      type="number"
                      min="1"
                      placeholder="Position"
                      className="w-24"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isPending} className="bg-green-900 hover:bg-green-950">
            {isPending ? (submitButtonText.includes('Update') ? 'Updating...' : 'Creating...') : submitButtonText}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

