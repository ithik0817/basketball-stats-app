// src/hooks/useFetchCourts.js
import { useState, useEffect } from 'react';
import { supabase } from "../supabaseClient";

export const useFetchCourts = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("courts")
          .select("*");

        if (error) throw error;
        setCourts(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { courts, loading, error };
};