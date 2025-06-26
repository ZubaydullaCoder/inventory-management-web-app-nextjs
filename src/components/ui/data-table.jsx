// /src/components/ui/data-table.jsx
"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Column definition for TanStack Table
 * @typedef {Object} ColumnDef
 * @property {string} accessorKey - Data accessor key
 * @property {string} header - Column header text
 * @property {Function} [cell] - Custom cell renderer
 * @property {boolean} [enableSorting] - Whether column is sortable
 * @property {boolean} [enableHiding] - Whether column can be hidden
 */

/**
 * Reusable data table component with sorting, filtering, and pagination
 * Built on TanStack Table v8 for headless table functionality
 * @param {Object} props - Component props
 * @param {Array} props.columns - Table column definitions
 * @param {Array} props.data - Table data
 * @param {string} [props.filterKey] - Key for global filter (defaults to first column)
 * @param {string} [props.filterPlaceholder] - Placeholder text for filter input
 * @returns {JSX.Element} Data table component
 */
export default function DataTable({
  columns,
  data,
  filterKey = null,
  filterPlaceholder = "Filter...",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get pagination from URL or set defaults
  const page = searchParams.get("page") ?? "1";
  const perPage = searchParams.get("per_page") ?? "10";

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [pagination, setPagination] = useState({
    pageIndex: Number(page) - 1,
    pageSize: Number(perPage),
  });

  // Update URL when pagination changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", (pagination.pageIndex + 1).toString());
    params.set("per_page", pagination.pageSize.toString());
    // Use replace to avoid adding to browser history and preserve scroll position
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pagination, router, pathname, searchParams]);

  // Determine the filter key (first column's accessorKey if not provided)
  const actualFilterKey = filterKey || columns[0]?.accessorKey;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    autoResetPageIndex: false, // Prevents pagination reset on data change
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
  });

  return (
    <div className="space-y-4">
      {/* Filter Input */}
      {actualFilterKey && (
        <div className="flex items-center">
          <Input
            placeholder={filterPlaceholder}
            value={table.getColumn(actualFilterKey)?.getFilterValue() ?? ""}
            onChange={(event) => {
              table
                .getColumn(actualFilterKey)
                ?.setFilterValue(event.target.value);
              table.setPageIndex(0); // Reset to first page on filter change
            }}
            className="max-w-sm"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} row(s) total.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              className="h-8 w-[70px] rounded border border-input bg-background px-2 text-sm"
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
