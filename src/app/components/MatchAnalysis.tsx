'use client';

import { Match } from '../types/Match';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, useMemo } from 'react';
import { useSavedInputsStore } from '../stores/savedInputsStore';
import { useDatesStateStore } from '../stores/datesStore';
import { AnalysisResult, analyzeMatches } from '../util/analysisUtils';
import SingleTeamAnalysis from './SingleTeamAnalysis';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, getSortedRowModel, SortingState } from '@tanstack/react-table';

interface MatchAnalysisProps {
    teamId: string;
    compare: string;
    beforeDate: Date | undefined;
    afterDate: Date | undefined;
  }
  type CombinedAnalysisData = AnalysisResult & {
    teamBResult: AnalysisResult;
  };
  const columnHelper = createColumnHelper<CombinedAnalysisData>();
  
const fetchMatches = async (teamId: string): Promise<Match[]> => {
  const response = await fetch(`/api/teams/${teamId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch matches');
  }
  return response.json();
};


// const getTeamResult = (teamResults: AnalysisResult[], map: string): AnalysisResult => {
//   const result = teamResults.find((r: AnalysisResult) => r.map === map);
//   return result || {
//     map,
//     totalMatches: 0,
//     wins: 0,
//     winPercentage: "0.00",
//     averageRoundDifference: "0.00"
//   };
// };

const MatchAnalysis: React.FC<MatchAnalysisProps> = ({ teamId, compare, beforeDate, afterDate }) => {
    const addInput = useSavedInputsStore((state) => state.addInput);
    const setMatchesLatestDate = useDatesStateStore((state) => state.setMatchesLatestDate);
    const setMatchesEarliestDate = useDatesStateStore((state) => state.setMatchesEarliestDate);
    const setMatchDates = useDatesStateStore((state) => state.setMatchDates);

    const { data: matches, error, isLoading } = useQuery({
      queryKey: ['fetchMatches', teamId],
      queryFn: () => fetchMatches(teamId),
      enabled: !!teamId
    });

    const { data: comparisonMatches, error: comparisonError, isLoading: comparisonLoading } = useQuery({
      queryKey: ['fetchComparisonData', compare],
      queryFn: () => fetchMatches(compare),
      enabled: !!compare,
    });


    useEffect(() => {
      if (matches && matches.length > 0) {
        // Save to local storage if data fetch was successful
        const value = teamId + " (" + matches[0].team +")"
        addInput(value);
      }
    }, [matches, teamId, addInput]);

    useEffect(() => {
      if (comparisonMatches && comparisonMatches.length > 0) {
        // Save to local storage if data fetch was successful
        const value = compare + " (" + comparisonMatches[0].team +")"
        addInput(value);
      }
    }, [comparisonMatches, compare, addInput]);

    useEffect(() => {
      // Function to extract and convert dates from a matches array
      const getDatesFromMatches = (matches: Match[] | undefined): number[] => {
        if (matches && matches.length > 0) {
          return matches.map((match: Match) => match.date);
        }
        return [];
      };
    
      // Extract dates from both comparisonMatches and matches
      const comparisonDates = getDatesFromMatches(comparisonMatches);
      const matchDates = getDatesFromMatches(matches);
    
      // Combine the dates from both arrays
      const allDates = [...comparisonDates, ...matchDates];
    
      if (allDates.length > 0) {
        // Convert all timestamps to Date objects
        const allDateObjects = allDates.map(date => new Date(date));
    
        // Find the earliest and latest dates
        const earliestDate = new Date(Math.min(...allDates));
        const latestDate = new Date(Math.max(...allDates));
    
        // Use the state store functions to set the dates
        setMatchesEarliestDate(earliestDate);
        setMatchesLatestDate(latestDate);
        setMatchDates(allDateObjects);
      } else {
        // If no dates are available, set matchDates to undefined
        setMatchDates(undefined);
      }
    }, [comparisonMatches, matches, setMatchesEarliestDate, setMatchesLatestDate, setMatchDates]);
  
    return (
      <div className="results">
        {(isLoading || comparisonLoading) && <div className="mb-4 text-red-500">Loading...</div>}
        {(error || comparisonError) && <div className="mb-4 text-red-500">Error: {error?.message || comparisonError?.message}</div>}
  
        {matches && comparisonMatches ? (
          <CombinedAnalysis matches={matches} comparisonMatches={comparisonMatches} afterDate={afterDate} beforeDate={beforeDate} />
        ) : (
          <>
            {matches && <SingleTeamAnalysis analysisData={analyzeMatches(matches, afterDate, beforeDate)} title={`${matches[0].team} Analysis`} />}
            {comparisonMatches && <SingleTeamAnalysis analysisData={analyzeMatches(comparisonMatches, afterDate, beforeDate)} title={`${comparisonMatches[0].team} Analysis`} />}
          </>
        )}
      </div>
    );
  };
  
  interface CombinedAnalysisProps {
    matches: Match[];
    comparisonMatches: Match[];
    beforeDate: Date | undefined;
    afterDate: Date | undefined;
  }

  const CombinedAnalysis: React.FC<CombinedAnalysisProps> = ({ matches, comparisonMatches, afterDate, beforeDate }) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    
    const teamAName = matches.length > 0 ? matches[0].team : "Team A";
    const teamBName = comparisonMatches.length > 0 ? comparisonMatches[0].team : "Team B";
  
    const data = useMemo(() => {
      const teamAResults = analyzeMatches(matches, afterDate, beforeDate);
      const teamBResults = analyzeMatches(comparisonMatches, afterDate, beforeDate);
  
      const allMaps = new Set([...teamAResults.map(result => result.map), ...teamBResults.map(result => result.map)]);
      
      return Array.from(allMaps).map(map => {
        const teamAResult = teamAResults.find(result => result.map === map) || {
          map,
          totalMatches: 0,
          wins: 0,
          winPercentage: '0',
          averageRoundDifference: '0',
        };
        const teamBResult = teamBResults.find(result => result.map === map) || {
          map,
          totalMatches: 0,
          wins: 0,
          winPercentage: '0',
          averageRoundDifference: '0',
        };
        return {
          ...teamAResult,
          teamBResult
        };
      });
    }, [matches, comparisonMatches, afterDate, beforeDate]);
    
    const columns = useMemo(() => [
      columnHelper.accessor('map', {
        header: 'Map',
        cell: info => info.getValue(),
        id: 'Map'
      }),
      columnHelper.group({
        header: 'Total Matches',
        id: 'total_matches',
        columns: [
          columnHelper.accessor('totalMatches', {
            header: teamAName,
            id: 'total_matches_a',
            cell: info => info.getValue(),
          }),
          columnHelper.accessor(row => row.teamBResult.totalMatches, {
            header: teamBName,
            id: 'total_matches_b',
            cell: info => info.getValue(),
          }),
          columnHelper.accessor(row => row.totalMatches - row.teamBResult.totalMatches, {
            id: 'totalMatchesDiff',
            header: 'Diff',
            cell: info => <span className={info.getValue() > 0 ? 'text-green-500' : info.getValue() < 0 ? 'text-red-500' : ''}>{info.getValue()}</span>,
          }),
        ],
      }),
      columnHelper.group({
        header: 'Wins',
        id: 'wins',
        columns: [
          columnHelper.accessor('wins', {
            header: teamAName,
            id: 'wins_a',
            cell: info => info.getValue(),
          }),
          columnHelper.accessor(row => row.teamBResult.wins, {
            header: teamBName,
            id: 'wins_b',
            cell: info => info.getValue(),
          }),
          columnHelper.accessor(row => row.wins - row.teamBResult.wins, {
            id: 'winsDiff',
            header: 'Diff',
            cell: info => <span className={info.getValue() > 0 ? 'text-green-500' : info.getValue() < 0 ? 'text-red-500' : ''}>{info.getValue()}</span>,
          }),
        ],
      }),
      columnHelper.group({
        header: 'Win Percentage',
        id: 'winpercentage',
        columns: [
          columnHelper.accessor('winPercentage', {
            header: teamAName,
            id: 'winpercentage_a',
            cell: info => `${info.getValue()}%`,
          }),
          columnHelper.accessor(row => row.teamBResult.winPercentage, {
            header: teamBName,
            id: 'winpercentage_b',
            cell: info => `${info.getValue()}%`,
          }),
          columnHelper.accessor(row => parseFloat(row.winPercentage) - parseFloat(row.teamBResult.winPercentage), {
            id: 'winPercentageDiff',
            header: 'Diff',
            cell: info => <span className={info.getValue() > 0 ? 'text-green-500' : info.getValue() < 0 ? 'text-red-500' : ''}>{info.getValue().toFixed(2)}%</span>,
          }),
        ],
      }),
      columnHelper.group({
        header: 'Average Round Difference',
        id: 'rounddiff',
        columns: [
          columnHelper.accessor('averageRoundDifference', {
            header: teamAName,
            id: 'rounddiff_a',
            cell: info => info.getValue(),
          }),
          columnHelper.accessor(row => row.teamBResult.averageRoundDifference, {
            header: teamBName,
            id: 'rounddiff_b',
            cell: info => info.getValue(),
          }),
          columnHelper.accessor(row => parseFloat(row.averageRoundDifference) - parseFloat(row.teamBResult.averageRoundDifference), {
            id: 'averageRoundDifferenceDiff',
            header: 'Diff',
            cell: info => <span className={info.getValue() > 0 ? 'text-green-500' : info.getValue() < 0 ? 'text-red-500' : ''}>{info.getValue().toFixed(2)}</span>,
          }),
        ],
      }),
    ], [teamAName, teamBName]);
  
    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: setSorting,
      state: { sorting }
    });
  
    return (
      <>
        <h2 className="mb-4 text-xl font-bold">Combined Analysis</h2>
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} colSpan={header.colSpan} className="p-2 border border-gray-300 text-center">
                    {header.isPlaceholder ? null : (
                      <div
                        className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                        title={header.column.getCanSort() 
                          ? header.column.getNextSortingOrder() === 'desc'
                            ? 'Sort desceding'
                            : header.column.getNextSortingOrder() === 'asc'
                              ? 'Sort ascending'
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
  
  export default MatchAnalysis;