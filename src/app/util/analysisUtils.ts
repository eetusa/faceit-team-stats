// analysisUtils.ts
import { Match } from "../types/Match";

export interface AnalysisResult {
  map: string;
  totalMatches: number;
  wins: number;
  winPercentage: string;
  averageRoundDifference: string;
}

export const analyzeMatches = (matches: Match[]): AnalysisResult[] => {
  const groupedByMap = matches.reduce((acc, match) => {
    const map = match.map;
    if (!acc[map]) {
      acc[map] = [];
    }
    acc[map].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  return Object.entries(groupedByMap).map(([map, matches]) => {
    const totalMatches = matches.length;
    const wins = matches.filter((match) => match.teamWin === '1').length;
    const winPercentage = (wins / totalMatches) * 100;

    const averageRoundDifference = (
      matches.reduce((sum, match) => {
        const [teamScore, opponentScore] = match.score.split(' / ').map(Number);
        const roundDifference = Math.abs(teamScore - opponentScore);
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
};