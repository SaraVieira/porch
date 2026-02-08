import { createFileRoute } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BsSteam } from 'react-icons/bs'
import { useState } from 'react'
import { ArrowUpDown, Trash2 } from 'lucide-react'
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from '@tanstack/react-table'
import type { games as gamesTable } from '@/db/schema'
import { formatDate, get } from '@/lib/utils'

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
import { AddGameModal } from '@/components/AddGameModal'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/books/games')({
  component: RouteComponent,
  loader: () => get('/api/games'),
})

function RouteComponent() {
  const defaultData = Route.useLoaderData()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const queryClient = useQueryClient()
  const { data: games } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const data = await get('/api/games')
      return data
    },
    initialData: defaultData,
  })
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'date', desc: true },
  ])

  const deleteGame = async (id: string) => {
    await fetch(`/api/games/${id}`, { method: 'DELETE' })
    queryClient.invalidateQueries({ queryKey: ['games'] })
  }

  const columns: Array<ColumnDef<typeof gamesTable.$inferSelect>> = [
    {
      accessorKey: 'image',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === 'asc')
            }
          >
            Image
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <img className="w-[100px]" src={row.getValue('image')} />
            </TooltipTrigger>
            <TooltipContent>{row.getValue('name')}</TooltipContent>
          </Tooltip>
        )
      },
      minSize: 100,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === 'asc')
            }
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="max-w-[220px] truncate">
              {row.getValue('name')}
            </div>
          </TooltipTrigger>
          <TooltipContent>{row.getValue('name')}</TooltipContent>
        </Tooltip>
      ),
    },
    {
      accessorKey: 'date',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === 'asc')
            }
          >
            Date Finished
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) =>
        row.getValue('date') ? formatDate(row.getValue('date')) : '',
    },
    {
      accessorKey: 'release',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === 'asc')
            }
          >
            Date Released
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) =>
        row.getValue('release') ? formatDate(row.getValue('release')) : '',
    },
    {
      accessorKey: 'score',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === 'asc')
            }
          >
            Score
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => row.getValue('score') + '/100',
    },
    {
      accessorKey: 'time',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === 'asc')
            }
          >
            Duration
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => `${parseFloat(row.getValue('time'))}h`,
    },
    {
      accessorKey: 'summary',
      header: 'Summary',
      cell: ({ row }) => (
        <Dialog>
          <DialogTrigger className="underline text-green-400">
            View Summary
          </DialogTrigger>
          <DialogContent>{row.getValue('summary')}</DialogContent>
        </Dialog>
      ),
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
      cell: ({ row }) => (
        <Dialog>
          <DialogTrigger className="underline text-green-400">
            View Notes
          </DialogTrigger>
          <DialogContent>{row.getValue('notes')}</DialogContent>
        </Dialog>
      ),
    },
    {
      accessorKey: 'steam',
      header: 'Steam Link',
      cell: ({ row }) => {
        const steam = row.getValue('steam')
        return (
          <>
            {!steam ? (
              ''
            ) : (
              <a
                href={`https://store.steampowered.com/app/${steam}/`}
                target="_blank"
                className="flex justify-center w-full"
              >
                <BsSteam />
              </a>
            )}
          </>
        )
      },
    },
    {
      id: 'delete',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteGame(row.original.id)}
          className="text-red-400 hover:text-red-300"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
    },
  ]
  const table = useReactTable({
    data: games,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className=" text-2xl font-bold">Games</h1>
        <AddGameModal />
      </div>
      <div className="overflow-hidden rounded-md border">
        <div className="flex items-center py-4 justify-end m-2">
          <Input
            placeholder="Filter games..."
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
            type="search"
          />
        </div>
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
