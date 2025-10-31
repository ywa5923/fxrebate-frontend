'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, X, Trash2, Edit, Columns3, Eraser, Sliders, ToggleLeft, ToggleRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { UserPermission, UserPermissionPagination } from '@/types/UserPermission';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteUserPermission, toggleUserPermission } from '@/lib/user-permission-requests';

type SortableColumn = 'id' | 'subject_type' | 'subject_id' | 'permission_type' | 'resource_id' | 'resource_value' | 'action' | 'is_active' | 'created_at' | 'updated_at';

interface PermissionsTableProps {
  data: UserPermission[];
  meta: UserPermissionPagination;
}

export function PermissionsTable({ data, meta }: PermissionsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);
  const [isBusy, startBusy] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filtersResetKey, setFiltersResetKey] = useState(0);
  const [permissionToDelete, setPermissionToDelete] = useState<{ id: number; label: string } | null>(null);
  const initialColumnVisibility = useMemo(() => {
    // Align with other tables: show all by default except updated_at
    return {
      index: true,
      id: true,
      subject_type: true,
      subject_id: false,
      user_data: true,
      permission_type: true,
      action: true,
      resource_id: false,
      resource_value: true,
      is_active: true,
      created_at: true,
      updated_at: false,
      actions: true,
    } as Record<string, boolean>;
  }, []);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(initialColumnVisibility);

  const currentPage = meta?.current_page || 1;
  const totalPages = meta?.last_page || 1;
  const perPage = meta?.per_page || 15;
  const total = meta?.total || data.length;

  const orderBy = searchParams.get('order_by') as SortableColumn | null;
  const orderDirection = (searchParams.get('order_direction') as 'asc' | 'desc') || 'asc';

  const [subject_type, setSubjectType] = useState(searchParams.get('subject_type') || '');
  const [subject_id, setSubjectId] = useState(searchParams.get('subject_id') || '');
  const [permission_type, setPermissionType] = useState(searchParams.get('permission_type') || '');
  const [resource_id, setResourceId] = useState(searchParams.get('resource_id') || '');
  const [resource_value, setResourceValue] = useState(searchParams.get('resource_value') || '');
  const [action, setAction] = useState(searchParams.get('action') || '');
  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [isActive, setIsActive] = useState(searchParams.get('is_active') || '');

  // Compute active filters directly from current URL params so header-applied filters are reflected immediately
  const activeFilterValues = [
    searchParams.get('subject_type'),
    searchParams.get('subject_id'),
    searchParams.get('permission_type'),
    searchParams.get('resource_id'),
    searchParams.get('resource_value'),
    searchParams.get('action'),
    searchParams.get('subject'),
    searchParams.get('is_active'),
  ];
  const hasActiveFilters = activeFilterValues.some(Boolean);

  // Keep filter panel fields in sync with URL-driven header filters
  useEffect(() => {
    setSubjectType(searchParams.get('subject_type') || '');
    setSubjectId(searchParams.get('subject_id') || '');
    setPermissionType(searchParams.get('permission_type') || '');
    setResourceId(searchParams.get('resource_id') || '');
    setResourceValue(searchParams.get('resource_value') || '');
    setAction(searchParams.get('action') || '');
    setSubject(searchParams.get('subject') || '');
    setIsActive(searchParams.get('is_active') || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const onSort = (column: SortableColumn) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (orderBy === column) {
        if (orderDirection === 'asc') params.set('order_direction', 'desc');
        else { params.delete('order_by'); params.delete('order_direction'); }
      } else {
        params.set('order_by', column);
        params.set('order_direction', 'asc');
      }
      params.set('page', '1');
      router.push(`/${locale}/control-panel/super-manager/user-permissions?${params.toString()}`);
    });
  };

  const sortHeader = (key: SortableColumn, label: string) => (
    <Button variant="ghost" onClick={() => onSort(key)} className="h-8 px-2 hover:bg-gray-100">
      {label}
      {orderBy === key ? (orderDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />) : <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
    </Button>
  );

  const setFilter = (key: string, value: string, anyValue?: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value || value === '' || (anyValue && value === anyValue)) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.set('page', '1');
      router.push(`/${locale}/control-panel/super-manager/user-permissions?${params.toString()}`);
    });
  };

  const formatDateUTC = (value: string | null) => {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '-';
    return d.toISOString().slice(0, 10);
  };

  const formatPermissionType = (value: string | null | undefined) => {
    if (!value) return '-';
    // Support new API values and keep legacy fallback just in case
    if (value === 'seo' || value === 'seo-country') return 'SEO';
    if (value === 'translator' || value === 'translator-country') return 'TRANSLATOR';
    return String(value).toUpperCase();
  };

  const columns: ColumnDef<UserPermission>[] = [
    { id: 'index', header: '#', cell: ({ row }) => ((currentPage - 1) * perPage + row.index + 1), meta: { headerClassName: 'bg-gray-100 font-semibold', cellClassName: 'bg-gray-50' } },
    { accessorKey: 'id', header: () => sortHeader('id', 'ID') },
    {
      accessorKey: 'subject_type',
      header: () => sortHeader('subject_type', 'User Type'),
    },
    {
      accessorKey: 'subject_id',
      header: () => sortHeader('subject_id', 'User ID'),
    },
    {
      id: 'user_data',
      header: 'User Data',
      cell: ({ row }) => {
        const subj = row.original.subject as any;
        if (!subj) return '-';
        return (
          <div className="leading-tight">
            <div className="font-medium">{subj.name}</div>
            <div className="text-xs text-gray-500">{subj.email}</div>
          </div>
        );
      }
    },
    {
      accessorKey: 'permission_type',
      header: () => sortHeader('permission_type', 'Permission Type'),
      cell: ({ row }) => formatPermissionType(row.getValue('permission_type') as string),
    },
    {
      accessorKey: 'action',
      header: () => sortHeader('action', 'Action'),
    },
    {
      accessorKey: 'resource_id',
      header: () => sortHeader('resource_id', 'Resource ID'),
    },
    {
      accessorKey: 'resource_value',
      header: () => sortHeader('resource_value', 'Resource Value'),
    },
    {
      accessorKey: 'is_active',
      header: () => sortHeader('is_active', 'Status'),
      cell: ({ row }) => (row.getValue('is_active') as boolean) ? 'Active' : 'Inactive'
    },
    { accessorKey: 'created_at', header: () => sortHeader('created_at', 'Created At'), cell: ({ row }) => formatDateUTC(row.getValue('created_at') as string | null) },
    { accessorKey: 'updated_at', header: () => sortHeader('updated_at', 'Updated At'), cell: ({ row }) => formatDateUTC(row.getValue('updated_at') as string | null) },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const perm = row.original;
        const label = `${perm.permission_type}:${perm.action}`;
        return (
          <div className="flex items-center gap-2">
            {(perm.permission_type === 'broker' || perm.permission_type === 'country' || perm.permission_type === 'zone' || perm.permission_type === 'seo' || perm.permission_type === 'translator') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/${locale}/control-panel/super-manager/user-permissions/${perm.permission_type}-permission/edit/${perm.id}`)}
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                title="Edit permission"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPermissionToDelete({ id: perm.id, label });
                setDeleteDialogOpen(true);
              }}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete permission"
              disabled={isBusy}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`${perm.is_active ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
              onClick={() => handleToggle(perm.id)}
              disabled={isBusy}
              title={perm.is_active ? 'Deactivate' : 'Activate'}
            >
              {perm.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({ 
    data, 
    columns, 
    getCoreRowModel: getCoreRowModel(), 
    manualPagination: true, 
    pageCount: totalPages,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  });

  // initial visibility set up-front via initialColumnVisibility

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(newPage));
      router.push(`/${locale}/control-panel/super-manager/user-permissions?${params.toString()}`);
    });
  };

  const handleApplyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (subject_type && subject_type !== 'any') {
        params.set('subject_type', subject_type);
      } else {
        params.delete('subject_type');
      }
      subject_id ? params.set('subject_id', subject_id) : params.delete('subject_id');
      if (permission_type && permission_type !== 'any') {
        params.set('permission_type', permission_type);
      } else {
        params.delete('permission_type');
      }
      resource_id ? params.set('resource_id', resource_id) : params.delete('resource_id');
      resource_value ? params.set('resource_value', resource_value) : params.delete('resource_value');
      if (action && action !== 'any') {
        params.set('action', action);
      } else {
        params.delete('action');
      }
      subject ? params.set('subject', subject) : params.delete('subject');
      if (isActive && isActive !== 'any') {
        params.set('is_active', isActive);
      } else {
        params.delete('is_active');
      }
      params.set('page', '1');
      router.push(`/${locale}/control-panel/super-manager/user-permissions?${params.toString()}`);
    });
  };

  const handleClearFilters = () => {
    setSubjectType(''); setSubjectId(''); setPermissionType(''); setResourceId(''); setResourceValue(''); setAction(''); setSubject(''); setIsActive('');
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      ['subject_type','subject_id','permission_type','resource_id','resource_value','action','subject','is_active'].forEach(k => params.delete(k));
      params.set('page', '1');
      router.push(`/${locale}/control-panel/super-manager/user-permissions?${params.toString()}`);
    });
    // force header filter controls to reset
    setFiltersResetKey((k) => k + 1);
  };

  const handleToggle = (id: number) => {
    startBusy(async () => {
      try {
        const res = await toggleUserPermission(id);
        if (res.success) {
          toast.success('Permission status updated');
          router.refresh();
        } else {
          toast.error(res.message || 'Failed to update status');
        }
      } catch {
        toast.error('Unexpected error');
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!permissionToDelete) return;
    startBusy(async () => {
      const { id, label } = permissionToDelete;
      try {
        const res = await deleteUserPermission(id);
        if (res.success) {
          toast.success('Permission deleted', { description: label });
          setDeleteDialogOpen(false);
          setPermissionToDelete(null);
          router.refresh();
        } else {
          toast.error(res.message || 'Failed to delete permission');
        }
      } catch {
        toast.error('Unexpected error');
      }
    });
  };

  return (
    <div className="space-y-4">
      {isBusy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            <p className="text-lg font-medium">Processing...</p>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete permission?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{permissionToDelete?.label}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPermissionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex items-center">
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <Filter className="h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {hasActiveFilters && (
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-600 rounded-full">
              {activeFilterValues.filter(Boolean).length}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="ml-2 gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
          >
            <Eraser className="h-4 w-4" />
            <span>Clear all filters</span>
          </Button>
        )}
        <div className="ml-auto" />
      </div>

      {showFilters && (
        <div className="bg-gray-50 border-2 border-dashed border-green-700 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject_type">User Type</Label>
              <Select onValueChange={(v) => setSubjectType(v)} defaultValue={subject_type || undefined}>
                <SelectTrigger id="subject_type">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="BrokerTeamUser">BrokerTeamUser</SelectItem>
                  <SelectItem value="PlatformUser">PlatformUser</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject_id">User ID</Label>
              <Input id="subject_id" placeholder="e.g., 123" value={subject_id} onChange={(e) => setSubjectId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()} style={{ backgroundColor: '#ffffff' }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permission_type">Permission Type</Label>
              <Select onValueChange={(v) => setPermissionType(v)} defaultValue={permission_type || 'any'}>
                <SelectTrigger id="permission_type">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="broker">BROKER</SelectItem>
                  <SelectItem value="country">COUNTRY</SelectItem>
                  <SelectItem value="zone">ZONE</SelectItem>
                  <SelectItem value="seo">SEO</SelectItem>
                  <SelectItem value="translator">TRANSLATOR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resource_id">Resource ID</Label>
              <Input id="resource_id" placeholder="e.g., 456" value={resource_id} onChange={(e) => setResourceId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()} style={{ backgroundColor: '#ffffff' }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resource_value">Resource Value</Label>
              <Input id="resource_value" placeholder="e.g., Trading Name" value={resource_value} onChange={(e) => setResourceValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()} style={{ backgroundColor: '#ffffff' }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select onValueChange={(v) => setAction(v)} defaultValue={action || 'any'}>
                <SelectTrigger id="action">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="manage">MANAGE</SelectItem>
                  <SelectItem value="edit">EDIT</SelectItem>
                  <SelectItem value="view">VIEW</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">User name or email</Label>
              <Input id="subject" placeholder="e.g., john@example.com or John Doe" value={subject} onChange={(e) => setSubject(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()} style={{ backgroundColor: '#ffffff' }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_active">Status</Label>
              <Select onValueChange={(v) => setIsActive(v)} defaultValue={isActive || 'any'}>
                <SelectTrigger id="is_active">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">ACTIVE</SelectItem>
                  <SelectItem value="0">INACTIVE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleApplyFilters} size="sm" className="bg-green-900 hover:bg-green-950 text-white">Apply Filters</Button>
            <Button onClick={handleClearFilters} variant="outline" size="sm">Clear</Button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
        <div>
          Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, total)} of {total} permissions
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3 gap-2 shrink-0 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800">
                <Sliders className="h-4 w-4" />
                <span className="hidden sm:inline">Select Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table.getAllLeafColumns().map((column) => {
                const columnLabelMap: Record<string, string> = {
                  index: '#',
                  id: 'ID',
                  subject_type: 'User Type',
                  subject_id: 'User ID',
                  user_data: 'User Data',
                  permission_type: 'Permission Type',
                  action: 'Action',
                  resource_id: 'Resource ID',
                  resource_value: 'Resource Value',
                  is_active: 'Status',
                  created_at: 'Created At',
                  updated_at: 'Updated At',
                  actions: 'Actions',
                };
                const label = columnLabelMap[column.id] ?? column.id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(v) => column.toggleVisibility(Boolean(v))}
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className={(header.column.columnDef.meta as any)?.headerClassName}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            {/* Second header row with inline filters matching Brokers layout */}
            <TableRow key={`filters-row-${filtersResetKey}`}>
              {table.getHeaderGroups()[0]?.headers.map((header) => {
                const colId = header.column.id;
                let control: React.ReactNode = null;
                if (colId === 'subject_type') {
                  control = (
                    <Select onValueChange={(v) => setFilter('subject_type', v, 'any')} defaultValue={(searchParams.get('subject_type') as string) || 'any'}>
                      <SelectTrigger className="h-8" key={`rst-${filtersResetKey}-subject_type`}>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">ANY</SelectItem>
                        <SelectItem value="BrokerTeamUser">BrokerTeamUser</SelectItem>
                        <SelectItem value="PlatformUser">PlatformUser</SelectItem>
                      </SelectContent>
                    </Select>
                  );
                } else if (colId === 'subject_id') {
                  control = (
                    <Input
                      id="hdr_subject_id"
                      defaultValue={(searchParams.get('subject_id') as string) || ''}
                      key={`rst-${filtersResetKey}-subject_id`}
                      onKeyDown={(e) => { if (e.key === 'Enter') setFilter('subject_id', (e.target as HTMLInputElement).value); }}
                      className="h-8 text-xs"
                      placeholder="Filter ID"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                } else if (colId === 'user_data') {
                  control = (
                    <Input
                      id="hdr_subject"
                      defaultValue={(searchParams.get('subject') as string) || ''}
                      key={`rst-${filtersResetKey}-subject`}
                      onKeyDown={(e) => { if (e.key === 'Enter') setFilter('subject', (e.target as HTMLInputElement).value); }}
                      className="h-8 text-xs"
                      placeholder="Filter user"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                } else if (colId === 'permission_type') {
                  control = (
                    <Select onValueChange={(v) => setFilter('permission_type', v, 'any')} defaultValue={(searchParams.get('permission_type') as string) || 'any'}>
                      <SelectTrigger className="h-8" key={`rst-${filtersResetKey}-permission_type`}>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="broker">BROKER</SelectItem>
                  <SelectItem value="country">COUNTRY</SelectItem>
                  <SelectItem value="zone">ZONE</SelectItem>
                  <SelectItem value="seo">SEO</SelectItem>
                  <SelectItem value="translator">TRANSLATOR</SelectItem>
                </SelectContent>
                    </Select>
                  );
                } else if (colId === 'action') {
                  control = (
                    <Select onValueChange={(v) => setFilter('action', v, 'any')} defaultValue={(searchParams.get('action') as string) || 'any'}>
                      <SelectTrigger className="h-8" key={`rst-${filtersResetKey}-action`}>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="manage">MANAGE</SelectItem>
                        <SelectItem value="edit">EDIT</SelectItem>
                        <SelectItem value="view">VIEW</SelectItem>
                      </SelectContent>
                    </Select>
                  );
                } else if (colId === 'resource_id') {
                  control = (
                    <Input
                      id="hdr_resource_id"
                      defaultValue={(searchParams.get('resource_id') as string) || ''}
                      key={`rst-${filtersResetKey}-resource_id`}
                      onKeyDown={(e) => { if (e.key === 'Enter') setFilter('resource_id', (e.target as HTMLInputElement).value); }}
                      className="h-8 text-xs"
                      placeholder="Filter ID"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                } else if (colId === 'resource_value') {
                  control = (
                    <Input
                      id="hdr_resource_value"
                      defaultValue={(searchParams.get('resource_value') as string) || ''}
                      key={`rst-${filtersResetKey}-resource_value`}
                      onKeyDown={(e) => { if (e.key === 'Enter') setFilter('resource_value', (e.target as HTMLInputElement).value); }}
                      className="h-8 text-xs"
                      placeholder="Filter value"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                } else if (colId === 'is_active') {
                  control = (
                    <Select onValueChange={(v) => setFilter('is_active', v, 'any')} defaultValue={(searchParams.get('is_active') as string) || 'any'}>
                      <SelectTrigger className="h-8" key={`rst-${filtersResetKey}-is_active`}>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="1">ACTIVE</SelectItem>
                        <SelectItem value="0">INACTIVE</SelectItem>
                      </SelectContent>
                    </Select>
                  );
                }
                return (
                  <TableHead key={`filter-${header.id}`} className={(header.column.columnDef.meta as any)?.headerClassName}>
                    {control}
                  </TableHead>
                );
              })}
            </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={!row.original.is_active ? 'bg-red-50/70' : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={(cell.column.columnDef.meta as any)?.cellClassName}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">No permissions found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} disabled={currentPage <= 1} className="h-8 px-2 sm:px-3" title="First page">
            <ChevronsLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">First</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1} className="h-8 px-2 sm:px-3" title="Previous page">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
          </Button>
          <div className="text-xs sm:text-sm font-medium px-2">{currentPage} / {totalPages}</div>
          <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages} className="h-8 px-2 sm:px-3" title="Next page">
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handlePageChange(totalPages)} disabled={currentPage >= totalPages} className="h-8 px-2 sm:px-3" title="Last page">
            <span className="hidden sm:inline mr-1">Last</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}


