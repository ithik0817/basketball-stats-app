// src/hooks/useRosterManager.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export default function useRosterManager(selectedGame) {
  const initialActiveRef = useRef({ home: false, away: false });
  const [homeRoster, setHomeRoster] = useState([]);
  const [awayRoster, setAwayRoster] = useState([]);
  const [activeHomePlayers, setActiveHomePlayers] = useState([]);
  const [activeAwayPlayers, setActiveAwayPlayers] = useState([]);

  useEffect(() => {
    if (!selectedGame?.home_team || !selectedGame?.away_team) return;

    const fetchRoster = async (teamId, setRoster) => {
      const { data, error } = await supabase
        .from('players')
        .select("*")
        .eq('team_id', teamId)
        .order('number', { ascending: true });

      if (error) console.error(`Error fetching roster for team ${teamId}:`, error);
      else setRoster(data || []);
    };    

    fetchRoster(selectedGame.home_team, setHomeRoster);
    fetchRoster(selectedGame.away_team, setAwayRoster);

    initialActiveRef.current = { home: false, away: false };
  }, [selectedGame]);
  

  useEffect(() => {
    if (homeRoster.length && !initialActiveRef.current.home) {
      const starters = homeRoster.filter(p => p.starter);
      setActiveHomePlayers(starters.length ? starters : homeRoster.slice(0, 5));
      initialActiveRef.current.home = true;
    }
  }, [homeRoster]);

  useEffect(() => {
    if (awayRoster.length && !initialActiveRef.current.away) {
      const starters = awayRoster.filter(p => p.starter);
      setActiveAwayPlayers(starters.length ? starters : awayRoster.slice(0, 5));
      initialActiveRef.current.away = true;
    }
  }, [awayRoster]);

  const handleSub = useCallback(
    (teamId, activePlayerIds, benchPlayerIds) => {
      const isAway = teamId === selectedGame.away_team;
      const fullRoster = isAway ? awayRoster : homeRoster;
      const setActive = isAway ? setActiveAwayPlayers : setActiveHomePlayers;

      setActive(prev => {
        let newRoster = [...prev];
        const playersIn = benchPlayerIds.map(id =>
          fullRoster.find(p => p.id === id)
        );
        activePlayerIds.forEach((outId, i) => {
          const playerIn = playersIn[i];
          const idx = newRoster.findIndex(p => p.id === outId);
          if (idx !== -1 && playerIn) newRoster[idx] = playerIn;
        });
        return newRoster.sort((a, b) => a.number - b.number);
      });
    },
    [awayRoster, homeRoster, selectedGame]
  );

  return {
    homeRoster,
    awayRoster,
    activeHomePlayers,
    activeAwayPlayers,
    handleSub,
  };
}
