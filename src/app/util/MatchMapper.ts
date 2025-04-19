import { Match } from "../types/Match";

type APIResponseItem = {
    _id: {
        matchId: string;
        teamId: string;
    };
    created_at: number;
    updated_at: number;
    i19: string;
    teamId: string;
    i3: string;
    i4: string;
    i5: string;
    premade: boolean;
    i17: string;
    c5: string;
    c9: string;
    c1: string;
    c23: string;
    c24: string;
    c25: string;
    c26: string;
    c27: string;
    c28: string;
    c29: string;
    c30: string;
    c31: string;
    c32: string;
    c33: string;
    c34: string;
    c35: string;
    c37: string;
    c6: string;
    c7: string;
    c8: string;
    bestOf: string;
    competitionId: string;
    date: number;
    game: string;
    gameMode: string;
    i0: string;
    i1: string;
    i12: string;
    i18: string;
    i2: string;
    matchId: string;
    matchRound: string;
    played: string;
    status: string;
};
  
export function mapToMatch(item: APIResponseItem): Match {
return {
    gameId: item._id.matchId,
    matchId: item.matchId,
    teamId: item._id.teamId,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    score: item.i18,
    teamWin: item.i17,
    firstHalfScore: item.i3,
    secondHalfScore: item.i4,
    team: item.i5,
    finalScore: item.c5,
    teamHeadshots: item.c9,
    teamKillDeathRatio: item.c6,
    teamKillRoundRatio: item.c7,
    teamHeadshotsPercentage: item.c8,
    region: item.i0,
    map: item.i1,
    rounds: item.i12,
    status: item.status,
    gameMode: item.gameMode,
    premade: item.premade,
    competitionId: item.competitionId,
    date: item.date,
    played: item.played,
    game: item.game,
    winner: item.i2,
    matchRound: item.matchRound,
    };
}