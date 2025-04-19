'use client';

import dynamic from 'next/dynamic'
const MatchAnalysis = dynamic(() => import('../components/MatchAnalysis'), { ssr: false })
import React from 'react';

type Params = {
  teamId: string;
};

export default function TeamPage({ params }: { params: Promise<Params> }) {
  const { teamId } = React.use(params);

  return (
    <div className="p-4">
      <MatchAnalysis teamId={teamId} />
    </div>
  );
}