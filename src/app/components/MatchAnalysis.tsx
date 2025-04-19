'use client';

import { Match } from '../types/Match';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSavedInputsStore } from '../stores/savedInputsStore';
import { useDatesStateStore } from '../stores/datesStore';
import { AnalysisResult, analyzeMatches } from '../util/analysisUtils';
import SingleTeamAnalysis from './SingleTeamAnalysis';

interface MatchAnalysisProps {
    teamId: string;
    compare: string;
    beforeDate: Date | undefined;
    afterDate: Date | undefined;
  }
  
const fetchMatches = async (teamId: string): Promise<Match[]> => {
  const response = await fetch(`/api/teams/${teamId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch matches');
  }
  return response.json();
};


const getTeamResult = (teamResults: AnalysisResult[], map: string): AnalysisResult => {
  const result = teamResults.find((r: AnalysisResult) => r.map === map);
  return result || {
    map,
    totalMatches: 0,
    wins: 0,
    winPercentage: "0.00",
    averageRoundDifference: "0.00"
  };
};

const MatchAnalysis: React.FC<MatchAnalysisProps> = ({ teamId, compare, beforeDate, afterDate }) => {
    const addInput = useSavedInputsStore((state) => state.addInput);
    const setMatchesLatestDate = useDatesStateStore((state) => state.setMatchesLatestDate);
    const setMatchesEarliestDate = useDatesStateStore((state) => state.setMatchesEarliestDate);

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
        // Find the earliest and latest dates
        const earliestDate = new Date(Math.min(...allDates));
        const latestDate = new Date(Math.max(...allDates));
    
        // Use the state store functions to set the dates
        setMatchesEarliestDate(earliestDate);
        setMatchesLatestDate(latestDate);
      }
    }, [comparisonMatches, matches, setMatchesEarliestDate, setMatchesLatestDate]);

  
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
    const teamAResults = analyzeMatches(matches, afterDate, beforeDate);
    const teamBResults = analyzeMatches(comparisonMatches, afterDate, beforeDate);

    const teamAName = matches.length > 0 ? matches[0].team : "Team A";
    const teamBName = comparisonMatches.length > 0 ? comparisonMatches[0].team : "Team A";
  
    return (
      <>
        <h2 className="mb-4 text-xl font-bold">Combined Analysis</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2 border border-gray-300 text-center" rowSpan={2}>Map</th>
              <th className="p-2 border border-gray-300 text-center" colSpan={3}>Total Matches</th>
              <th className="p-2 border border-gray-300 text-center" colSpan={3}>Wins</th>
              <th className="p-2 border border-gray-300 text-center" colSpan={3}>Win Percentage</th>
              <th className="p-2 border border-gray-300 text-center" colSpan={3}>Average Round Difference</th>
            </tr>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2 border border-gray-300 text-center">{teamAName}</th>
              <th className="p-2 border border-gray-300 text-center">{teamBName}</th>
              <th className="p-2 border border-gray-300 text-center">Diff</th>
              <th className="p-2 border border-gray-300 text-center">{teamAName}</th>
              <th className="p-2 border border-gray-300 text-center">{teamBName}</th>
              <th className="p-2 border border-gray-300 text-center">Diff</th>
              <th className="p-2 border border-gray-300 text-center">{teamAName}</th>
              <th className="p-2 border border-gray-300 text-center">{teamBName}</th>
              <th className="p-2 border border-gray-300 text-center">Diff</th>
              <th className="p-2 border border-gray-300 text-center">{teamAName}</th>
              <th className="p-2 border border-gray-300 text-center">{teamBName}</th>
              <th className="p-2 border border-gray-300 text-center">Diff</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const allMaps = new Set([...teamAResults.map(result => result.map), ...teamBResults.map(result => result.map)]);
              const allMapsArray = Array.from(allMaps);

              // Calculate win percentage for sorting
              const mapsWithTeamAWinPercentage = allMapsArray.map(map => {
                const teamAResult = getTeamResult(teamAResults, map);
                const teamBResult = getTeamResult(teamBResults, map);
                const teamAWinPercentage = parseFloat(teamAResult.winPercentage);

                return {
                  map,
                  teamAWinPercentage,
                  teamAResult,
                  teamBResult,
                };
              });

              // Sort maps by Team A's win percentage in descending order
              mapsWithTeamAWinPercentage.sort((a, b) => b.teamAWinPercentage - a.teamAWinPercentage);

              // Render sorted maps
              return mapsWithTeamAWinPercentage.map(({ map, teamAResult, teamBResult }, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}>
                  <td className="p-2 border border-gray-300 text-center">{map}</td>
                  <td className="p-2 border border-gray-300 text-center">{teamAResult.totalMatches}</td>
                  <td className="p-2 border border-gray-300 text-center">{teamBResult.totalMatches}</td>
                  <td className={`p-2 border border-gray-300 text-center ${teamAResult.totalMatches - teamBResult.totalMatches > 0 ? 'text-green-500' : teamAResult.totalMatches - teamBResult.totalMatches < 0 ? 'text-red-500' : ''}`}>
                    {teamAResult.totalMatches - teamBResult.totalMatches}
                  </td>
                  <td className="p-2 border border-gray-300 text-center">{teamAResult.wins}</td>
                  <td className="p-2 border border-gray-300 text-center">{teamBResult.wins}</td>
                  <td className={`p-2 border border-gray-300 text-center ${teamAResult.wins - teamBResult.wins > 0 ? 'text-green-500' : teamAResult.wins - teamBResult.wins < 0 ? 'text-red-500' : ''}`}>
                    {teamAResult.wins - teamBResult.wins}
                  </td>
                  <td className="p-2 border border-gray-300 text-center">{teamAResult.winPercentage}%</td>
                  <td className="p-2 border border-gray-300 text-center">{teamBResult.winPercentage}%</td>
                  <td className={`p-2 border border-gray-300 text-center ${parseFloat(teamAResult.winPercentage) - parseFloat(teamBResult.winPercentage) > 0 ? 'text-green-500' : parseFloat(teamAResult.winPercentage) - parseFloat(teamBResult.winPercentage) < 0 ? 'text-red-500' : ''}`}>
                    {(parseFloat(teamAResult.winPercentage) - parseFloat(teamBResult.winPercentage)).toFixed(2)}%
                  </td>
                  <td className="p-2 border border-gray-300 text-center">{teamAResult.averageRoundDifference}</td>
                  <td className="p-2 border border-gray-300 text-center">{teamBResult.averageRoundDifference}</td>
                  <td className={`p-2 border border-gray-300 text-center ${parseFloat(teamAResult.averageRoundDifference) - parseFloat(teamBResult.averageRoundDifference) > 0 ? 'text-green-500' : parseFloat(teamAResult.averageRoundDifference) - parseFloat(teamBResult.averageRoundDifference) < 0 ? 'text-red-500' : ''}`}>
                    {(parseFloat(teamAResult.averageRoundDifference) - parseFloat(teamBResult.averageRoundDifference)).toFixed(2)}
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </>
    );
  };
  
  export default MatchAnalysis;