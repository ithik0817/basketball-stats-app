// src/hooks/useFetchPlayers.js
import { useState, useEffect } from 'react';
import { supabase } from "../supabaseClient";

export const useFetchPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("players")
          .select("*")
          .order("number", { ascending: true });

        if (error) throw error;
        setPlayers(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { players, loading, error };
};