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
import { AddConferenceModal } from '@/components/AddConferenceModal'

export const Route = createFileRoute('/books/conferences')({
  component: RouteComponent,
  loader: () => get('/api/conferences'),
})

export const columns: Array<ColumnDef<typeof conferences.$inferSelect>> = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'city',
    header: 'City',
  },
  {
    accessorKey: 'link',
    header: 'Link',
    cell: ({ row }) => {
      return (
        <a
          href={row.getValue('link')}
          target="_blank"
          rel="noreferrer"
          className="text-green-600 underline"
        >
          {row.getValue('link')}
        </a>
      )
    },
  },
  {
    accessorKey: 'country_flag',
    header: 'Country',
    cell: ({ row }) => {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <img src={row.getValue('country_flag')} className="w-8" />
          </TooltipTrigger>
          <TooltipContent>{row.original.country_name}</TooltipContent>
        </Tooltip>
      )
    },
  },
]

function RouteComponent() {
  const conferencesBase = Route.useLoaderData()
  const { data: conferences } = useQuery({
    queryKey: ['conferences'],
    queryFn: () => get('/api/conferences'),
    initialData: conferencesBase,
  })
  const table = useReactTable({
    data: conferences,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  return (
    <>
      <div className="flex items-center mb-4 justify-between">
        <h1 className="mb-4 text-2xl font-bold">Conferences</h1>
        <AddConferenceModal />
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
