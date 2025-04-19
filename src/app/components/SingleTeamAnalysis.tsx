import React from 'react';
import { AnalysisResult } from '../util/analysisUtils';

interface SingleTeamAnalysisProps {
  analysisData: AnalysisResult[];
  title: string;
}

const SingleTeamAnalysis: React.FC<SingleTeamAnalysisProps> = ({ analysisData, title }) => (
    <>
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="p-2 border border-gray-300">Map</th>
            <th className="p-2 border border-gray-300">Total Matches</th>
            <th className="p-2 border border-gray-300">Wins</th>
            <th className="p-2 border border-gray-300">Win Percentage</th>
            <th className="p-2 border border-gray-300">Average Round Difference</th>
          </tr>
        </thead>
        <tbody>
          {analysisData.map((result, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}>
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
  );

export default SingleTeamAnalysis;