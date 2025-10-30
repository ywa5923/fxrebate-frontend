'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
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
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, X, Trash2, Power } from 'lucide-react';
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
  const [permissionToDelete, setPermissionToDelete] = useState<{ id: number; label: string } | null>(null);

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

  const hasActiveFilters = [subject_type, subject_id, permission_type, resource_id, resource_value, action, subject, isActive].some(Boolean);

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

  const formatDateUTC = (value: string | null) => {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '-';
    return d.toISOString().slice(0, 10);
  };

  const columns: ColumnDef<UserPermission>[] = [
    { id: 'index', header: '#', cell: ({ row }) => ((currentPage - 1) * perPage + row.index + 1), meta: { headerClassName: 'bg-gray-100 font-semibold', cellClassName: 'bg-gray-50' } },
    { accessorKey: 'id', header: () => sortHeader('id', 'ID') },
    { accessorKey: 'subject_type', header: () => sortHeader('subject_type', 'User Type') },
    { accessorKey: 'subject_id', header: () => sortHeader('subject_id', 'User ID') },
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
    { accessorKey: 'permission_type', header: () => sortHeader('permission_type', 'Permission Type') },
    { accessorKey: 'action', header: () => sortHeader('action', 'Action') },
    { accessorKey: 'resource_id', header: () => sortHeader('resource_id', 'Resource ID') },
    { accessorKey: 'resource_value', header: () => sortHeader('resource_value', 'Resource Value') },
    { accessorKey: 'is_active', header: () => sortHeader('is_active', 'Status'), cell: ({ row }) => (row.getValue('is_active') as boolean) ? 'Active' : 'Inactive' },
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
              variant="outline"
              size="sm"
              className={`${perm.is_active ? 'bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700' : 'bg-gray-400 hover:bg-gray-500 text-white border-gray-400 hover:border-gray-500'}`}
              onClick={() => handleToggle(perm.id)}
              disabled={isBusy}
              title={perm.is_active ? 'Deactivate' : 'Activate'}
            >
              <Power className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), manualPagination: true, pageCount: totalPages });

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
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <Filter className="h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {hasActiveFilters && (
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-600 rounded-full">
              {[subject_type, subject_id, permission_type, resource_id, resource_value, action].filter(Boolean).length}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="gap-2 text-red-600 hover:text-red-700">
            <X className="h-4 w-4" />
            Clear All Filters
          </Button>
        )}
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
              <Input id="subject_id" placeholder="1" value={subject_id} onChange={(e) => setSubjectId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()} style={{ backgroundColor: '#ffffff' }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permission_type">Permission Type</Label>
              <Select onValueChange={(v) => setPermissionType(v)} defaultValue={permission_type || undefined}>
                <SelectTrigger id="permission_type">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">ANY</SelectItem>
                  <SelectItem value="broker">BROKER</SelectItem>
                  <SelectItem value="country">COUNTRY</SelectItem>
                  <SelectItem value="zone">ZONE</SelectItem>
                  <SelectItem value="seo-country">SEO-COUNTRY</SelectItem>
                  <SelectItem value="translator-country">TRANSLATOR-COUNTRY</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resource_id">Resource ID</Label>
              <Input id="resource_id" placeholder="182" value={resource_id} onChange={(e) => setResourceId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()} style={{ backgroundColor: '#ffffff' }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resource_value">Resource Value</Label>
              <Input id="resource_value" placeholder="some value" value={resource_value} onChange={(e) => setResourceValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()} style={{ backgroundColor: '#ffffff' }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select onValueChange={(v) => setAction(v)} defaultValue={action || undefined}>
                <SelectTrigger id="action">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">ANY</SelectItem>
                  <SelectItem value="manage">MANAGE</SelectItem>
                  <SelectItem value="edit">EDIT</SelectItem>
                  <SelectItem value="view">VIEW</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Default User" value={subject} onChange={(e) => setSubject(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()} style={{ backgroundColor: '#ffffff' }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_active">Status</Label>
              <Select onValueChange={(v) => setIsActive(v)} defaultValue={isActive || undefined}>
                <SelectTrigger id="is_active">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">ANY</SelectItem>
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
        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, total)} of {total} permissions
        </div>
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


