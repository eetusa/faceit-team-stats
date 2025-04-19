'use client';

import { Match } from '../types/Match';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSavedInputsStore } from '../stores/savedInputsStore';

interface MatchAnalysisProps {
    teamId: string;
  }
  
const fetchMatches = async (teamId: string): Promise<Match[]> => {
  const response = await fetch(`/api/teams/${teamId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch matches');
  }
  return response.json();
};

const MatchAnalysis: React.FC<MatchAnalysisProps> = ({ teamId }) => {
    const { data: matches, error, isLoading } = useQuery({
      queryKey: ['fetchMatches', teamId],
      queryFn: () => fetchMatches(teamId),
      enabled: !!teamId
    });
    const addInput = useSavedInputsStore((state) => state.addInput);

    useEffect(() => {
      if (matches && matches.length > 0) {
        // Save to local storage if data fetch was successful
        const value = teamId + " (" + matches[0].team +")"
        addInput(value);
      }
    }, [matches, teamId, addInput]);

  
    const analyzeMatches = (matches: Match[]) => {
        const groupedByMap = matches.reduce((acc, match) => {
          const map = match.map;
          if (!acc[map]) {
            acc[map] = [];
          }
          acc[map].push(match);
          return acc;
        }, {} as Record<string, Match[]>);
        const analysis = Object.entries(groupedByMap).map(([map, matches]) => {
          const totalMatches = matches.length;
          const wins = matches.filter(match => match.teamWin === '1').length;
          const winPercentage = (wins / totalMatches) * 100;
      
          const averageRoundDifference = (
            matches.reduce((sum, match) => {
              const [teamScore, opponentScore] = match.score.split(' / ').map(Number);
              let roundDifference;
              if (match.teamWin === '1') {
                roundDifference = Math.max(teamScore, opponentScore) - Math.min(teamScore, opponentScore);
              } else {
                roundDifference = Math.min(teamScore, opponentScore) - Math.max(teamScore, opponentScore);
              }
              return sum + roundDifference;
            }, 0) / totalMatches
          ).toFixed(2);
      
          return {
            map,
            totalMatches,
            wins,
            winPercentage: winPercentage.toFixed(2),
            averageRoundDifference,
          };
        });
      
        analysis.sort((a, b) => b.totalMatches - a.totalMatches);
      
        return analysis;
      };
      
      return (
        <div className="results">
          {isLoading && <div className="mb-4 text-red-500">Loading...</div>}
          {error && <div className="mb-4 text-red-500">Error: {error.message}</div>}
          {matches && (
            <>
              <h2 className="mb-4 text-xl font-bold">
                {matches.length > 0 ? `${matches[0].team} Analysis` : 'Match Analysis'}
              </h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border border-gray-300">Map</th>
                    <th className="p-2 border border-gray-300">Total Matches</th>
                    <th className="p-2 border border-gray-300">Wins</th>
                    <th className="p-2 border border-gray-300">Win Percentage</th>
                    <th className="p-2 border border-gray-300">Average Round Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {analyzeMatches(matches).map((result, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-2 border border-gray-300 text-center">{result.map}</td>
                      <td className="p-2 border border-gray-300 text-center">{result.totalMatches}</td>
                      <td className="p-2 border border-gray-300 text-center">{result.wins}</td>
                      <td className="p-2 border border-gray-300 text-center">{result.winPercentage}%</td>
                      <td className="p-2 border border-gray-300 text-center">{result.averageRoundDifference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      );
  };
  
  export default MatchAnalysis;