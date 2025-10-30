'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
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
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit, Trash2, ToggleLeft, ToggleRight, Filter, X, Sliders, Eraser } from 'lucide-react';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
import { deletePlatformUser, togglePlatformUser } from '@/lib/platform-user-requests';

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
  const [filtersResetKey, setFiltersResetKey] = useState(0);
  const initialColumnVisibility = useMemo(() => {
    const map: Record<string, boolean> = {};
    const keys = ['index','id','name','email','role','is_active','last_login_at','created_at','updated_at','actions'];
    keys.forEach((id) => {
      const shouldHide = /id$/i.test(id) || id === 'created_at' || id === 'updated_at';
      map[id] = !shouldHide;
    });
    return map;
  }, []);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(initialColumnVisibility);

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
  const [isActive, setIsActive] = useState(searchParams.get('is_active') || '');

  const hasActiveFilters = searchParams.get('name') || searchParams.get('email') || searchParams.get('role') || searchParams.get('is_active');

  // Sync panel fields with URL/header filters
  useEffect(() => {
    setName(searchParams.get('name') || '');
    setEmail(searchParams.get('email') || '');
    setRole(searchParams.get('role') || '');
    setIsActive(searchParams.get('is_active') || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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

  const setFilter = (key: string, value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value.length > 0) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set('page', '1');
      router.push(`/${locale}/control-panel/super-manager/platform-users?${params.toString()}`);
    });
  };

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
    {
      accessorKey: 'name',
      header: () => sortHeader('name', 'Name'),
    },
    {
      accessorKey: 'email',
      header: () => sortHeader('email', 'Email'),
    },
    {
      accessorKey: 'role',
      header: () => sortHeader('role', 'Role'),
    },
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
              variant="ghost"
              size="sm"
              className={`${user.is_active ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
              onClick={() => handleToggleStatus(user)}
              disabled={isBusy}
              title={user.is_active ? 'Deactivate user' : 'Activate user'}
            >
              {user.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
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

  // no-op: we set initial visibility up-front to avoid flash of visible columns

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
        const res = await togglePlatformUser(user.id);
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
      if (isActive && isActive !== 'any') { params.set('is_active', isActive); } else { params.delete('is_active'); }
      params.set('page', '1');
      router.push(`/${locale}/control-panel/super-manager/platform-users?${params.toString()}`);
    });
  };

  const handleClearFilters = () => {
    setName(''); setEmail(''); setRole(''); setIsActive('');
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('name'); params.delete('email'); params.delete('role'); params.delete('is_active');
      params.set('page', '1');
      router.push(`/${locale}/control-panel/super-manager/platform-users?${params.toString()}`);
    });
    setFiltersResetKey((k) => k + 1);
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
      <div className="flex items-center">
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
          <Button variant="outline" size="sm" onClick={handleClearFilters} className="ml-2 gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800">
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

      <div className="flex items-center justify-end mt-2 gap-2">
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
                name: 'Name',
                email: 'Email',
                role: 'Role',
                is_active: 'Status',
                last_login_at: 'Last Login',
                created_at: 'Created At',
                updated_at: 'Updated At',
                actions: 'Actions',
              };
              const label = columnLabelMap[column.id as string] ?? String(column.id).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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
            {/* Second header row with inline filters, aligned with columns */}
            <TableRow key={`filters-row-${filtersResetKey}`}>
              {table.getHeaderGroups()[0]?.headers.map((header) => {
                const colId = header.column.id;
                let control: React.ReactNode = null;
                if (colId === 'name') {
                  control = (
                    <Input
                      id="hdr_name"
                      defaultValue={searchParams.get('name') || ''}
                      key={`rst-${filtersResetKey}-name`}
                      onKeyDown={(e) => e.key === 'Enter' && setFilter('name', (e.target as HTMLInputElement).value)}
                      className="h-8 text-xs"
                      placeholder="Filter name"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                } else if (colId === 'email') {
                  control = (
                    <Input
                      id="hdr_email"
                      defaultValue={searchParams.get('email') || ''}
                      key={`rst-${filtersResetKey}-email`}
                      onKeyDown={(e) => e.key === 'Enter' && setFilter('email', (e.target as HTMLInputElement).value)}
                      className="h-8 text-xs"
                      placeholder="Filter email"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                } else if (colId === 'role') {
                  control = (
                    <Input
                      id="hdr_role"
                      defaultValue={searchParams.get('role') || ''}
                      key={`rst-${filtersResetKey}-role`}
                      onKeyDown={(e) => e.key === 'Enter' && setFilter('role', (e.target as HTMLInputElement).value)}
                      className="h-8 text-xs"
                      placeholder="Filter role"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  );
                  } else if (colId === 'is_active') {
                    control = (
                      <Select onValueChange={(v) => setFilter('is_active', v === 'any' ? '' : v)} defaultValue={(searchParams.get('is_active') as string) || 'any'}>
                        <SelectTrigger className="h-8" key={`rst-${filtersResetKey}-is_active`}>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">ANY</SelectItem>
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


