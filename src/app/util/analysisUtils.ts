import { Match } from "../types/Match";

export interface AnalysisResult {
  map: string;
  totalMatches: number;
  wins: number;
  winPercentage: number;
  averageRoundDifference: number;
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
        const [teamAScore, teamBScore] = match.score.split(' / ').map(Number);
        let roundDifference;

        if (match.teamWin === '1') {
          // Team won, calculate positive difference
          roundDifference = Math.abs(teamAScore - teamBScore);
        } else {
          // Team lost, calculate negative difference
          roundDifference = -Math.abs(teamAScore - teamBScore);
        }

        return sum + roundDifference;
      }, 0) / totalMatches
    ).toFixed(2);

    return {
      map,
      totalMatches,
      wins,
      winPercentage: parseFloat(winPercentage.toFixed(2)), // Convert string to number
      averageRoundDifference: parseFloat(averageRoundDifference), // Convert string to number,
    };
  });
};