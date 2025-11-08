// src/hooks/useFetchSeasons.js
import { useState, useEffect } from 'react';
import { supabase } from "../supabaseClient";

export const useFetchSeasons = () => {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("seasons")
          .select("*");

        if (error) throw error;
        setSeasons(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { seasons, loading, error };
};