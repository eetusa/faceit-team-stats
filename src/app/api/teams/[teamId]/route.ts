import { NextRequest } from 'next/server';
import type { Match } from '../../../types/Match'
import { MatchAPIv1 } from '../../MatchAPIv1';

const matchApi = new MatchAPIv1();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ teamId: string }> }
  ) {
    const teamId = (await params).teamId;

    if (!teamId || typeof teamId !== 'string') {
      return new Response('Invalid team id', {
        status: 403
      });
    }
  
    try {
      const matches: Match[] = await matchApi.fetchTeamData(teamId);
      return Response.json(matches);
    } catch (error) {
      return new Response('Failed to fetch matches: ' + error, {
        status: 500
      });
    }
  }
