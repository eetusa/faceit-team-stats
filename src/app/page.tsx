'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSavedInputsStore } from './stores/savedInputsStore';
import Creatable from 'react-select/creatable';
import dynamic from 'next/dynamic'
type Option = {
  value: string;
  label: string;
};

const MatchAnalysis = dynamic(() => import('./components/MatchAnalysis'), { ssr: false })

const HomePage: React.FC = () => {
  const [teamId, setTeamId] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const savedInputs = useSavedInputsStore((state) => state.savedInputs);
  const setSavedInput = useSavedInputsStore((state) => state.setSavedInputs);

  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    const teamIdFromUrl = searchParams.get('teamId');
    if (teamIdFromUrl) {
      setTeamId(teamIdFromUrl);
    }

    const parsedOptions: Option[] = savedInputs.map((input) => {
      const openParenIndex = input.indexOf('(');
      const value = input.substring(0, openParenIndex).trim();
      const label = input.substring(openParenIndex + 1, input.length - 1).trim();

      return { value, label };
    });

    setOptions(parsedOptions);

  }, [searchParams, savedInputs]);

  useEffect(() => {
    const savedInputs = JSON.parse(localStorage.getItem('savedInputs') || '[]');
    setSavedInput(savedInputs);
  }, [])

  const handleChange = (newValue: Option | null, actionMeta: any) => {
    if (newValue) {
      const teamId: string = newValue.value;
      setTeamId(teamId);

      // Update the URL query parameters
      const query = new URLSearchParams(window.location.search);
      query.set('teamId', teamId);
      // Assuming you have a routing mechanism in place
      router.push(`?${query.toString()}`, { scroll: false });
    } else {
      setTeamId(null);
      router.push("/");
    }
  };

  return (
    <div className="p-4">
        <Creatable
          instanceId="UUID123ixkshy"
          isClearable
          options={options}
          onChange={handleChange}
          placeholder="Select or query for a team"
      />
      {teamId && <MatchAnalysis teamId={teamId} />}
    </div>
  );
};

export default HomePage;