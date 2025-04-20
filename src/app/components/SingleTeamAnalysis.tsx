import React, { useMemo, useState } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getSortedRowModel, SortingState } from '@tanstack/react-table';
import { AnalysisResult } from '../util/analysisUtils';

interface SingleTeamAnalysisProps {
  analysisData: AnalysisResult[];
  title: string;
}

const columnHelper = createColumnHelper<AnalysisResult>();

const SingleTeamAnalysis: React.FC<SingleTeamAnalysisProps> = ({ analysisData, title }) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(() => [
    columnHelper.accessor('map', {
      header: 'Map',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('totalMatches', {
      header: 'Total Matches',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('wins', {
      header: 'Wins',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('winPercentage', {
      header: 'Win Percentage',
      cell: info => `${info.getValue()}%`,
    }),
    columnHelper.accessor('averageRoundDifference', {
      header: 'Average Round Difference',
      cell: info => info.getValue(),
    }),
  ], []);

  const table = useReactTable({
    data: analysisData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  console.log(analysisData)

  return (
    <>
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="bg-gray-100 dark:bg-gray-800">
              {headerGroup.headers.map(header => (
                <th key={header.id} colSpan={header.colSpan} className="p-2 border border-gray-300 text-center">
                  {header.isPlaceholder ? null : (
                    <div
                      className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                      onClick={header.column.getToggleSortingHandler()}
                      title={header.column.getCanSort()
                        ? header.column.getNextSortingOrder() === 'asc'
                          ? 'Sort ascending'
                          : header.column.getNextSortingOrder() === 'desc'
                            ? 'Sort descending'
                            : 'Clear sort'
                        : undefined}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className={row.index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="p-2 border border-gray-300 text-center">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default SingleTeamAnalysis;