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
  const [compareTeamId, setCompareTeamId] = useState('');

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

    const handleChange = (newValue: Option | null) => {
      if (newValue) {
        let newTeamId: string = newValue.value;
        setTeamId(newTeamId);

        const urlPattern = /\/teams\/([a-f0-9-]+)/i;
        const urlMatch = newTeamId.match(urlPattern);

        if (urlMatch) {
          newTeamId = urlMatch[1]; // Extract the team ID from the URL
        }

        if (newTeamId) {
          setTeamId(newTeamId);
          const query = new URLSearchParams(window.location.search);
          query.set('teamId', newTeamId);
          router.push(`?${query.toString()}`, { scroll: false });
        }
      } else {
        setTeamId('');
        router.push("/");
      }
    };

  const handleCompareTeamChange = (newValue: Option | null) => {
    if (newValue) {
      let newTeamId: string = newValue.value;
      setCompareTeamId(newTeamId);

      const urlPattern = /\/teams\/([a-f0-9-]+)/i;
      const urlMatch = newTeamId.match(urlPattern);

      if (urlMatch) {
        newTeamId = urlMatch[1]; // Extract the team ID from the URL
      }

      if (newTeamId && teamId && teamId != '') {
        setCompareTeamId(newTeamId);
        const query = new URLSearchParams(window.location.search);
        query.set('teamId', teamId);
        query.set('compare', newTeamId)
        router.push(`?${query.toString()}`, { scroll: false });
      }
    } else {
      setCompareTeamId('');
      router.push("/");
    }
  };

  return (
    <div className="p-4">
        Team
        <Creatable
          instanceId="UUID123ixkshy"
          isClearable
          options={options}
          onChange={handleChange}
          placeholder="Give a FACEIT team id, team URL or select a previously queried team"
      />

      Compare
      <Creatable
          instanceId="UUID123ixkshy"
          isClearable
          options={options}
          onChange={handleCompareTeamChange}
          placeholder="Compare"
      />
      {teamId && <MatchAnalysis teamId={teamId} compare={compareTeamId} />}
    </div>

    
  );
};

export default HomePage;