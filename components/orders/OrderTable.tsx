'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { OrderListItem } from '@/types/orders'
import { OrderDetailsModal } from './OrderDetailsModal'

interface OrderTableProps {
  orders: OrderListItem[]
}

export function OrderTable({ orders }: OrderTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null)

  const columns: ColumnDef<OrderListItem>[] = [
    {
      accessorKey: 'poNumber',
      header: 'PO Number',
    },
    {
      accessorKey: 'customerName',
      header: 'Customer Name',
    },
    {
      accessorKey: 'orderDate',
      header: 'Order Date',
      cell: ({ row }) => {
        return new Date(row.getValue('orderDate')).toLocaleDateString()
      },
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('totalAmount'))
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount)
        return formatted
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold
            ${status === 'Processing' ? 'bg-yellow-200 text-yellow-800' :
            status === 'Shipped' ? 'bg-blue-200 text-blue-800' :
            status === 'Delivered' ? 'bg-green-200 text-green-800' :
            'bg-red-200 text-red-800'}`}>
            {status}
          </span>
        )
      },
    },
    {
      accessorKey: 'estimatedShipDate',
      header: 'Est. Ship Date',
      cell: ({ row }) => {
        return new Date(row.getValue('estimatedShipDate')).toLocaleDateString()
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const order = row.original
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedOrder(order.id)}
          >
            View Details
          </Button>
        )
      },
    },
  ]

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      {selectedOrder && (
        <OrderDetailsModal 
          orderId={selectedOrder}
          showModal={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  )
}
