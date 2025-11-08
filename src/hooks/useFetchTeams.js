// src/hooks/useFetchTeams.js
import { useState, useEffect } from 'react';
import { supabase } from "../supabaseClient";

export const useFetchTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("teams")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;
        setTeams(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { teams, loading, error };
};