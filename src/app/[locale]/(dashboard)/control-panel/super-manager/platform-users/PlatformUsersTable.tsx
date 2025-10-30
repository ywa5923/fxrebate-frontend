'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit, Trash2, Power, Filter, X } from 'lucide-react';
import type { PlatformUser, PlatformUserPagination } from '@/types/PlatformUser';
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
import { deletePlatformUser, updatePlatformUser } from '@/lib/platform-user-requests';

interface PlatformUsersTableProps {
  data: PlatformUser[];
  meta: PlatformUserPagination;
}

type SortableColumn = 'id' | 'name' | 'email' | 'role' | 'is_active' | 'last_login_at' | 'created_at' | 'updated_at';

export function PlatformUsersTable({ data, meta }: PlatformUsersTableProps) {
  const formatDateUTC = (value: string | null) => {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '-';
    // YYYY-MM-DD for deterministic SSR/CSR match
    return d.toISOString().slice(0, 10);
  };
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);
  const [isBusy, startBusy] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: number; name: string } | null>(null);

  const currentPage = meta?.current_page || 1;
  const totalPages = meta?.last_page || 1;
  const perPage = meta?.per_page || 15;
  const total = meta?.total || data.length;

  const orderBy = searchParams.get('order_by') as SortableColumn | null;
  const orderDirection = (searchParams.get('order_direction') as 'asc' | 'desc') || 'asc';

  // Filters (basic ones for now)
  const [name, setName] = useState(searchParams.get('name') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [role, setRole] = useState(searchParams.get('role') || '');

  const hasActiveFilters = searchParams.get('name') || searchParams.get('email') || searchParams.get('role');

  const onSort = (column: SortableColumn) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (orderBy === column) {
        if (orderDirection === 'asc') {
          params.set('order_direction', 'desc');
        } else {
          params.delete('order_by');
          params.delete('order_direction');
        }
      } else {
        params.set('order_by', column);
        params.set('order_direction', 'asc');
      }
      params.set('page', '1');
      router.push(`/${locale}/control-panel/super-manager/platform-users?${params.toString()}`);
    });
  };

  const sortHeader = (key: SortableColumn, label: string) => (
    <Button variant="ghost" onClick={() => onSort(key)} className="h-8 px-2 hover:bg-gray-100">
      {label}
      {orderBy === key ? (
        orderDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
      ) : (
        <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
      )}
    </Button>
  );

  const columns: ColumnDef<PlatformUser>[] = [
    {
      id: 'index',
      header: '#',
      cell: ({ row }) => {
        const rowNumber = (currentPage - 1) * perPage + row.index + 1;
        return <div className="font-medium text-gray-700">{rowNumber}</div>;
      },
      meta: { headerClassName: 'bg-gray-100 font-semibold', cellClassName: 'bg-gray-50' },
    },
    { accessorKey: 'id', header: () => sortHeader('id', 'ID') },
    { accessorKey: 'name', header: () => sortHeader('name', 'Name') },
    { accessorKey: 'email', header: () => sortHeader('email', 'Email') },
    { accessorKey: 'role', header: () => sortHeader('role', 'Role') },
    {
      accessorKey: 'is_active',
      header: () => sortHeader('is_active', 'Status'),
      cell: ({ row }) => {
        const isActive = row.getValue('is_active') as boolean;
        return (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className={isActive ? 'text-green-700 font-medium' : 'text-gray-500'}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'last_login_at',
      header: () => sortHeader('last_login_at', 'Last Login'),
      cell: ({ row }) => {
        const date = row.getValue('last_login_at') as string | null;
        return formatDateUTC(date);
      },
    },
    {
      accessorKey: 'created_at',
      header: () => sortHeader('created_at', 'Created At'),
      cell: ({ row }) => {
        const date = row.getValue('created_at') as string | null;
        return formatDateUTC(date);
      },
    },
    {
      accessorKey: 'updated_at',
      header: () => sortHeader('updated_at', 'Updated At'),
      cell: ({ row }) => {
        const date = row.getValue('updated_at') as string | null;
        return formatDateUTC(date);
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/${locale}/control-panel/super-manager/platform-users/edit/${user.id}`)}
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Edit user"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setUserToDelete({ id: user.id, name: user.name });
                setDeleteDialogOpen(true);
              }}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete user"
              disabled={isBusy}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`${user.is_active ? 'bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700' : 'bg-gray-400 hover:bg-gray-500 text-white border-gray-400 hover:border-gray-500'}`}
              onClick={() => handleToggleStatus(user)}
              disabled={isBusy}
              title={user.is_active ? 'Deactivate user' : 'Activate user'}
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
      router.push(`/${locale}/control-panel/super-manager/platform-users?${params.toString()}`);
    });
  };

  const handleToggleStatus = (user: PlatformUser) => {
    startBusy(async () => {
      try {
        const res = await updatePlatformUser(user.id, {
          name: user.name,
          email: user.email,
          role: user.role,
          is_active: !user.is_active,
        });
        if (res.success) {
          toast.success('Status updated');
          router.refresh();
        } else {
          toast.error(res.message || 'Failed to update status');
        }
      } catch (e) {
        toast.error('Unexpected error');
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    startBusy(async () => {
      const { id, name } = userToDelete;
      try {
        const res = await deletePlatformUser(id);
        if (res.success) {
          toast.success('User deleted', { description: `User "${name}" removed.` });
          setDeleteDialogOpen(false);
          setUserToDelete(null);
          router.refresh();
        } else {
          toast.error(res.message || 'Failed to delete user');
        }
      } catch {
        toast.error('Unexpected error');
      }
    });
  };

  const handleApplyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      name ? params.set('name', name) : params.delete('name');
      email ? params.set('email', email) : params.delete('email');
      role ? params.set('role', role) : params.delete('role');
      params.set('page', '1');
      router.push(`/${locale}/control-panel/super-manager/platform-users?${params.toString()}`);
    });
  };

  const handleClearFilters = () => {
    setName(''); setEmail(''); setRole('');
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('name'); params.delete('email'); params.delete('role');
      params.set('page', '1');
      router.push(`/${locale}/control-panel/super-manager/platform-users?${params.toString()}`);
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
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>&quot;{userToDelete?.name}&quot;</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <Filter className="h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {hasActiveFilters && (
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-600 rounded-full">
              {[searchParams.get('name'), searchParams.get('email'), searchParams.get('role')].filter(Boolean).length}
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
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="e.g., John" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()} style={{ backgroundColor: '#ffffff' }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="e.g., user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()} style={{ backgroundColor: '#ffffff' }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" placeholder="e.g., zone_admin" value={role} onChange={(e) => setRole(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()} style={{ backgroundColor: '#ffffff' }} />
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
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={(cell.column.columnDef.meta as any)?.cellClassName}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">No platform users found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, total)} of {total} users
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


