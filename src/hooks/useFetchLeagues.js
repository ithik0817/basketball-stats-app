// src/hooks/useFetchLeagues.js
import { useState, useEffect } from 'react';
import { supabase } from "../supabaseClient";

export const useFetchLeagues = () => {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("leagues")
          .select("*");

        if (error) throw error;
        setLeagues(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { leagues, loading, error };
};