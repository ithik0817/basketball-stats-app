// src/hooks/useFetchGames.js
import { useState, useEffect } from 'react';
import { supabase } from "../supabaseClient";
import { useFetchTeams } from "./useFetchTeams";
import { useFetchCourts } from "./useFetchCourts";
import { useFetchSeasons } from "./useFetchSeasons";
import { useFetchLeagues } from "./useFetchLeagues";

export const useFetchGames = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { teams } = useFetchTeams();
  const { courts } = useFetchCourts();
  const { seasons } = useFetchSeasons();
  const { leagues } = useFetchLeagues();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("games")
          .select("*")
          .order('date', { ascending: true });

        if (error) throw error;

        const enriched = data.map((g) => {
          const homeTeam = teams.find((t) => t.id === g.home_team);
          const awayTeam = teams.find((t) => t.id === g.away_team);
          const court = courts.find((c) => c.id === g.court);
          const season = seasons.find((s) => s.id === g.season);
          const league = leagues.find((l) => l.id === g.league);
          return {
            ...g,
            homeName: homeTeam?.name || "Unknown home team name",
            homeAbb: homeTeam?.abbreviation || "Unknown home team abbreviation",
            awayName: awayTeam?.name || "Unknown away team name",
            awayAbb: awayTeam?.abbreviation || "Unknown away team abbreviation",
            courtName: court?.court_type || "Unknown court",
            courtCode: court?.court_code || "Unknown court code",
            courtWidth: court?.widthFt || "Unknown court width",
            courtHeight: court?.heightFt || "Unknown court height",
            courtRadius3: court?.threeRadiusFt || "Unknown court radius 3",
            courtRimOffet: court?.rimOffsetFt || "Unknown court rim offset",
            courtCorner3Width: court?.widthFtBoxCorner3 || "Unknown court corner 3 width",
            courtCorner3Height: court?.heightFtBoxCorner3 || "Unknown court corner 3 height",
            courtPaintWidth: court?.widthFtBoxInsidePaint || "Unknown court inside paint width",
            courtPaintHeight: court?.heightFtBoxInsidePaint || "Unknown court inside paint height",
            season: season?.year || "Unknown season",
            maxTimeout: league?.timeoutMax || "Unknown team max timeout",
            maxTimeoutOT: league?.timeoutMaxOT || "Unknown team max timeout OT",
            maxFoul: league?.foulMax || "Unknown team max foul",
            maxFoulOT: league?.foulMaxOT || "Unknown team max foul OT",
          };

        });

        setGames(enriched);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [teams, courts]);

  return { games, loading, error };
};