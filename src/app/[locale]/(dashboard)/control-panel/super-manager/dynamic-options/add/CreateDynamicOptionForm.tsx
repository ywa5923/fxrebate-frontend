'use client';

import { useState, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createDynamicOption, type OptionCategory, type FormMetaData, type CreateDynamicOptionInput } from '@/lib/dynamic-option-requests';
import { toast } from 'sonner';
import type { DropdownList } from '@/types/DropdownList';

interface CreateDynamicOptionFormProps {
  dropdownLists: DropdownList[];
  optionCategories: OptionCategory[];
  formMetaData: FormMetaData | null;
}

export default function CreateDynamicOptionForm({
  dropdownLists,
  optionCategories,
  formMetaData,
}: CreateDynamicOptionFormProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [isPending, startTransition] = useTransition();

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [applicableFor, setApplicableFor] = useState('');
  const [dataType, setDataType] = useState('');
  const [formType, setFormType] = useState('');
  const [metaData, setMetaData] = useState('');
  const [forCrypto, setForCrypto] = useState(false);
  const [forBrokers, setForBrokers] = useState(false);
  const [forProps, setForProps] = useState(false);
  const [required, setRequired] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const [tooltip, setTooltip] = useState('');
  const [minConstraint, setMinConstraint] = useState('');
  const [maxConstraint, setMaxConstraint] = useState('');
  const [loadInDropdown, setLoadInDropdown] = useState<boolean | null>(null);
  const [defaultLoading, setDefaultLoading] = useState<boolean | null>(null);
  const [defaultLoadingPosition, setDefaultLoadingPosition] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<number | null>(null);
  const [positionInCategory, setPositionInCategory] = useState<number | null>(null);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [allowSorting, setAllowSorting] = useState<boolean | null>(null);
  const [categoryName, setCategoryName] = useState<number | null>(null);
  const [dropdownListAttached, setDropdownListAttached] = useState<number | null>(null);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_');

  const handleNameChange = (value: string) => {
    setName(value);
    // Auto-generate slug from name
    setSlug(slugify(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!slug.trim()) {
      toast.error('Slug is required');
      return;
    }
    if (!applicableFor.trim()) {
      toast.error('Applicable For is required');
      return;
    }
    if (!dataType.trim()) {
      toast.error('Data Type is required');
      return;
    }
    if (!formType.trim()) {
      toast.error('Form Type is required');
      return;
    }

    const formData: CreateDynamicOptionInput = {
      name: name.trim(),
      slug: slug.trim(),
      applicable_for: applicableFor.trim(),
      data_type: dataType.trim(),
      form_type: formType.trim(),
      meta_data: metaData.trim() || null,
      for_crypto: forCrypto ? 1 : 0,
      for_brokers: forBrokers ? 1 : 0,
      for_props: forProps ? 1 : 0,
      required: required ? 1 : 0,
      placeholder: placeholder.trim() || null,
      tooltip: tooltip.trim() || null,
      min_constraint: minConstraint.trim() || null,
      max_constraint: maxConstraint.trim() || null,
      // Default to 0 (false) for nullable boolean fields instead of null
      load_in_dropdown: loadInDropdown === true ? 1 : 0,
      default_loading: defaultLoading === true ? 1 : (defaultLoading === false ? 0 : null),
      // Default integer fields to 0 instead of null to avoid database constraint violations
      default_loading_position: defaultLoadingPosition || 0,
      dropdown_position: dropdownPosition || 0,
      position_in_category: positionInCategory || 0,
      is_active: isActive === true ? 1 : (isActive === false ? 0 : null),
      allow_sorting: allowSorting === true ? 1 : (allowSorting === false ? 0 : null),
      category_name: categoryName || null,
      dropdown_list_attached: dropdownListAttached || null,
    };

    startTransition(async () => {
      const res = await createDynamicOption(formData);
      if (res.success) {
        toast.success('Dynamic option created successfully');
        router.push(`/${locale}/control-panel/super-manager/dynamic-options`);
        router.refresh();
      } else {
        const errorMessage = typeof res.message === 'string' ? res.message : JSON.stringify(res.message || 'Unknown error');
        toast.error('Failed to create dynamic option', { description: errorMessage });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Required Fields Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Required Fields</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Trading Name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="e.g., trading_name"
              required
            />
          </div>
        </div>
      </div>

      {/* Applicability Section */}
      <div className="space-y-4 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold">Applicability</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="applicable_for">Select Dynamic Table *</Label>
            <Select value={applicableFor} onValueChange={setApplicableFor} required disabled={!formMetaData}>
              <SelectTrigger id="applicable_for">
                <SelectValue placeholder={!formMetaData ? 'Loading...' : 'Select dynamic table'} />
              </SelectTrigger>
              <SelectContent>
                {formMetaData?.applicable_for?.map((value, index) => (
                  <SelectItem key={value || index} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="for_brokers"
                checked={forBrokers}
                onCheckedChange={(checked) => setForBrokers(checked === true)}
              />
              <Label htmlFor="for_brokers">For Brokers</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="for_crypto"
                checked={forCrypto}
                onCheckedChange={(checked) => setForCrypto(checked === true)}
              />
              <Label htmlFor="for_crypto">For Crypto</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="for_props"
                checked={forProps}
                onCheckedChange={(checked) => setForProps(checked === true)}
              />
              <Label htmlFor="for_props">For Props</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Form View Section */}
      <div className="space-y-4 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold">Form View Section</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="data_type">Data Type *</Label>
            <Select value={dataType} onValueChange={setDataType} required disabled={!formMetaData}>
              <SelectTrigger id="data_type">
                <SelectValue placeholder={!formMetaData ? 'Loading...' : 'Select data type'} />
              </SelectTrigger>
              <SelectContent>
                {formMetaData?.data_type?.map((value, index) => (
                  <SelectItem key={value || index} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="form_type">Form Type *</Label>
            <Select value={formType} onValueChange={setFormType} required disabled={!formMetaData}>
              <SelectTrigger id="form_type">
                <SelectValue placeholder={!formMetaData ? 'Loading...' : 'Select form type'} />
              </SelectTrigger>
              <SelectContent>
                {formMetaData?.form_type?.map((value, index) => (
                  <SelectItem key={value || index} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="placeholder">Placeholder</Label>
            <Input
              id="placeholder"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              placeholder="e.g., Enter trading name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tooltip">Tooltip</Label>
            <Input
              id="tooltip"
              value={tooltip}
              onChange={(e) => setTooltip(e.target.value)}
              placeholder="Help text for users"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min_constraint">Min Constraint</Label>
            <Input
              id="min_constraint"
              type="number"
              value={minConstraint}
              onChange={(e) => setMinConstraint(e.target.value)}
              placeholder="Minimum value"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_constraint">Max Constraint</Label>
            <Input
              id="max_constraint"
              type="number"
              value={maxConstraint}
              onChange={(e) => setMaxConstraint(e.target.value)}
              placeholder="Maximum value"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              checked={required}
              onCheckedChange={(checked) => setRequired(checked === true)}
            />
            <Label htmlFor="required">Required</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dropdown_list_attached">Dropdown List Attached</Label>
            <Select
              value={dropdownListAttached ? dropdownListAttached.toString() : 'any'}
              onValueChange={(value) => setDropdownListAttached(value === 'any' ? null : parseInt(value))}
            >
              <SelectTrigger id="dropdown_list_attached">
                <SelectValue placeholder="Select dropdown list" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">None</SelectItem>
                {dropdownLists.map((list) => (
                  <SelectItem key={list.id} value={list.id.toString()}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="meta_data">Meta Data</Label>
            <Textarea
              id="meta_data"
              value={metaData}
              onChange={(e) => setMetaData(e.target.value)}
              placeholder="JSON string or additional data"
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={isActive === true}
              onCheckedChange={(checked) => setIsActive(checked === true ? true : checked === false ? false : null)}
            />
            <Label htmlFor="is_active">Is Active</Label>
          </div>
        </div>
      </div>

      {/* Category Section */}
      <div className="space-y-4 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold">Category Section</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category_name">Category Name</Label>
            <Select
              value={categoryName ? categoryName.toString() : 'any'}
              onValueChange={(value) => setCategoryName(value === 'any' ? null : parseInt(value))}
            >
              <SelectTrigger id="category_name">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">None</SelectItem>
                {optionCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="position_in_category">Position in Category</Label>
            <Input
              id="position_in_category"
              type="number"
              min="1"
              value={positionInCategory || ''}
              onChange={(e) => setPositionInCategory(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Position"
            />
          </div>
        </div>
      </div>

      {/* Brokers Table Settings */}
      <div className="space-y-4 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold">Brokers Table Settings</h3>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allow_sorting"
              checked={allowSorting === true}
              onCheckedChange={(checked) => setAllowSorting(checked === true ? true : checked === false ? false : null)}
            />
            <Label htmlFor="allow_sorting">Allow Sorting</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="load_in_dropdown"
              checked={loadInDropdown === true}
              onCheckedChange={(checked) => setLoadInDropdown(checked === true ? true : checked === false ? false : null)}
            />
            <Label htmlFor="load_in_dropdown">Load in Dropdown</Label>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="dropdown_position" className="whitespace-nowrap">Dropdown Position</Label>
            <Input
              id="dropdown_position"
              type="number"
              min="1"
              value={dropdownPosition || ''}
              onChange={(e) => setDropdownPosition(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Position"
              className="w-24"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="default_loading"
              checked={defaultLoading === true}
              onCheckedChange={(checked) => setDefaultLoading(checked === true ? true : checked === false ? false : null)}
            />
            <Label htmlFor="default_loading">Default Loading</Label>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="default_loading_position" className="whitespace-nowrap">Default Loading Position</Label>
            <Input
              id="default_loading_position"
              type="number"
              min="1"
              value={defaultLoadingPosition || ''}
              onChange={(e) => setDefaultLoadingPosition(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Position"
              className="w-24"
            />
          </div>
        </div>
      </div>


      {/* Submit Buttons */}
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isPending} className="bg-green-900 hover:bg-green-950">
          {isPending ? 'Creating...' : 'Create Dynamic Option'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

