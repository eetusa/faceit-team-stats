import axios from 'axios';
import { Match } from '@/app/types/Match';
import { mapToMatch } from '@/app/util/MatchMapper';

export class MatchAPIv1 {
  private baseURL: string;

  constructor() {
    this.baseURL = 'https://www.faceit.com/api/stats/v1/stats/time';
  }

  async fetchTeamData(teamId: string): Promise<Match[]> {
    let allData: Match[] = [];
    let page = 0;
    const size = 100;

    try {
      while (true) {
        const response = await axios.get(`${this.baseURL}/teams/${teamId}/games/cs2`, {
          params: { page, size }
        });

        const data = response.data;
        if (data.length === 0) break;

        // Map response to Match type
        const matches: Match[] = data.map(mapToMatch);
        allData = allData.concat(matches);

        page++;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    return allData;
  }
}