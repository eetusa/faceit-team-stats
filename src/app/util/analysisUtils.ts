import { Match } from "../types/Match";

export interface AnalysisResult {
  map: string;
  totalMatches: number;
  wins: number;
  winPercentage: string;
  averageRoundDifference: string;
}

export const analyzeMatches = (
  matches: Match[],
  afterDate: Date | undefined,
  beforeDate: Date | undefined
): AnalysisResult[] => {
  // Convert the date objects to Unix time (milliseconds since epoch)
  const afterDateUnix = afterDate ? afterDate.getTime() : undefined;
  const beforeDateUnix = beforeDate ? beforeDate.getTime() : undefined;

  // Filter matches based on the date range
  const filteredMatches = matches.filter((match) => {
    const matchDateUnix = match.date;
    // Check if the match falls within the specified date range
    const isAfterDate = afterDateUnix ? matchDateUnix >= afterDateUnix : true;
    const isBeforeDate = beforeDateUnix ? matchDateUnix <= beforeDateUnix : true;
    return isAfterDate && isBeforeDate;
  });

  // Group the filtered matches by map
  const groupedByMap = filteredMatches.reduce((acc, match) => {
    const map = match.map;
    if (!acc[map]) {
      acc[map] = [];
    }
    acc[map].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  // Analyze the grouped matches
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