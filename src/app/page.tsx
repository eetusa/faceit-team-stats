'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSavedInputsStore } from './stores/savedInputsStore';
import { useDatesStateStore } from './stores/datesStore';
import Creatable from 'react-select/creatable';
import dynamic from 'next/dynamic'  
import { StylesConfig } from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import the CSS for the date picker
import './datepicker.css';  // Custom styles'

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
  const [afterDate, setAfterDate] = useState<Date | undefined>(undefined);
  const [beforeDate, setBeforeDate] = useState<Date | undefined>(undefined);
  const matchesLatestDate = useDatesStateStore((state) => state.matchesLatestDate);
  const matchesEarliestDate = useDatesStateStore((state) => state.matchesEarliestDate);

  const [options, setOptions] = useState<Option[]>([]);

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const teamIdFromUrl = searchParams.get('teamId');
    const compareIdFromUrl = searchParams.get('compare');

    if (teamIdFromUrl) {
      setTeamId(teamIdFromUrl);
    }
    if (compareIdFromUrl) {
      setCompareTeamId(compareIdFromUrl);
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

    const matchDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(matchDarkMode.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    matchDarkMode.addEventListener('change', handleChange);

    return () => {
      matchDarkMode.removeEventListener('change', handleChange);
    };
  }, [])

  useEffect(() => {
      console.log(matchesEarliestDate, matchesLatestDate)
  }, [matchesEarliestDate, matchesLatestDate])

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

    const customStyles: StylesConfig<Option, false> = {
      control: (styles) => ({
        ...styles,
        backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
        borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
        color: isDarkMode ? '#F3F4F6' : '#111827',
      }),
      singleValue: (styles) => ({
        ...styles,
        color: isDarkMode ? '#F3F4F6' : '#111827',
      }),
      menu: (styles) => ({
        ...styles,
        backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
      }),
      option: (styles, { isFocused }) => ({
        ...styles,
        backgroundColor: isFocused
          ? isDarkMode ? '#4B5563' : '#E5E7EB'
          : isDarkMode ? '#374151' : '#F9FAFB',
        color: isDarkMode ? '#F3F4F6' : '#111827',
      }),
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

  const selectedTeamOption = options.find(option => option.value === teamId);
  const selectedCompareOption = options.find(option => option.value === compareTeamId);

  return (
    <div className="p-4">
        <div>Team</div>
        <Creatable
          instanceId="UUID123ixkshy"
          isClearable
          options={options}
          onChange={handleChange}
          styles={customStyles}
          value={selectedTeamOption}
          placeholder="Give a FACEIT team id, team URL or select a previously queried team"
      />

      <div>Compare</div>
      <Creatable
          instanceId="UUID123ixkshy"
          isClearable
          options={options}
          onChange={handleCompareTeamChange}
          styles={customStyles}
          placeholder="Compare"
          value={selectedCompareOption}
      />
      
      <div>After Date</div>
      <DatePicker
        selected={afterDate}
        onChange={(newDate) => {
          if (newDate == null) {
            setAfterDate(undefined)
          } else {
            setAfterDate(newDate);
          }
        }}
        placeholderText="Select after date"
        className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}
        showPopperArrow={false}
        popperPlacement="bottom-start"
        calendarClassName={isDarkMode ? 'react-datepicker-dark' : 'react-datepicker-light'}
        minDate={matchesEarliestDate}
        maxDate={matchesLatestDate}
        isClearable={true}
        openToDate={
          afterDate !== undefined ? afterDate : matchesEarliestDate !== undefined ? matchesEarliestDate : undefined
        }
        disabled={(teamId === undefined || teamId === null || teamId === '')}
        dateFormat="yyyy/MM/dd"
      />

      <div>Before Date</div>
      <DatePicker
        selected={beforeDate}
        onChange={(newDate) => {
          if (newDate == null) {
            setBeforeDate(undefined)
          } else {
            setBeforeDate(newDate);
          }
        }}
        placeholderText="Select before date"
        className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}
        showPopperArrow={false}
        popperPlacement="bottom-start"
        calendarClassName={isDarkMode ? 'react-datepicker-dark' : 'react-datepicker-light'}
        minDate={matchesEarliestDate}
        maxDate={matchesLatestDate}
        isClearable={true}
        disabled={(teamId === undefined || teamId === null || teamId === '')}
        openToDate={
          beforeDate !== undefined ? beforeDate : matchesLatestDate !== undefined ? matchesLatestDate : undefined
        }
        dateFormat="yyyy/MM/dd"
      />
      {teamId && <MatchAnalysis teamId={teamId} compare={compareTeamId} beforeDate={beforeDate} afterDate={afterDate} />}
    </div>

    
  );
};

export default HomePage;