import { createFileRoute } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import type { conferences } from '@/db/schema'
import { get } from '@/lib/utils'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AddCountryModal } from '@/components/AddCountryModal'

export const Route = createFileRoute('/books/countries')({
  component: RouteComponent,
  loader: () => get('/api/countries'),
})

export const columns: Array<ColumnDef<typeof conferences.$inferSelect>> = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'region',
    header: 'Region',
  },
  {
    accessorKey: 'flag',
    header: 'Flag',
    cell: ({ row }) => {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <img src={row.getValue('flag')} className="w-8" />
          </TooltipTrigger>
          <TooltipContent>{row.original.name}</TooltipContent>
        </Tooltip>
      )
    },
  },
]

function RouteComponent() {
  const defaultData = Route.useLoaderData()
  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const data = await get('/api/countries')
      return data
    },
    initialData: defaultData,
  })
  const table = useReactTable({
    data: countries,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="mb-4 text-2xl font-bold">Conferences</h1>
        <AddCountryModal />
      </div>
      <div className="overflow-hidden rounded-md border">
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
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
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
    </>
  )
}
